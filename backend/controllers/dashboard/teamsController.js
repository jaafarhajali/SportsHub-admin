const asyncHandler = require("express-async-handler");
const Team = require("../../models/teamModel");
const User = require("../../models/userModel");
const Notification = require("../../models/notificationModel");
const Role = require("../../models/roleModel");

exports.getAllTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().populate("leader", "username").populate("members", "username");

  res.status(200).json({
    success: true,
    count: teams.length,
    data: teams,
  });
});

exports.createTeamByAdmin = asyncHandler(async (req, res) => {
  const { name, leaderId, members = [] } = req.body;

  const leader = await User.findById(leaderId);
  if (!leader) return res.status(404).json({ error: "Leader not found" });
  if (leader.team) return res.status(400).json({ error: "Leader is already in a team" });

  // ✅ Validate members (exist + not in a team)
  const validMembers = await User.find({
    _id: { $in: members },
    team: null,
  });
  const validMemberIds = validMembers.map((m) => m._id.toString());

  // ✅ Create team with only the leader
  const team = await Team.create({
    name,
    leader: leaderId,
    members: [leaderId], // Only leader added initially
  });

  // ✅ Set leader role to "teamLeader"
  const teamLeaderRole = await Role.findOne({ name: "teamLeader" });
  if (!teamLeaderRole) return res.status(500).json({ error: "Role 'teamLeader' not found" });

  await User.findByIdAndUpdate(leaderId, {
    role: {
      id: teamLeaderRole._id,
      name: teamLeaderRole.name,
    },
    team: team._id,
  });

  // ✅ Notify leader
  const leaderNotification = await Notification.create({
    user: leaderId,
    message: `You are now the team leader of "${team.name}" created by an admin.`,
    type: "info",
    metadata: { teamId: team._id },
  });

  await User.findByIdAndUpdate(leaderId, {
    $push: { notifications: leaderNotification._id },
  });

  // ✅ Invite members (notification only — not added to team yet)
  await Promise.all(
    validMemberIds.map(async (memberId) => {
      const notification = await Notification.create({
        user: memberId,
        message: `You have been invited to join the team "${team.name}".`,
        type: "invite",
        metadata: {
          teamId: team._id,
          senderId: leaderId,
        },
      });

      await User.findByIdAndUpdate(memberId, {
        $push: { notifications: notification._id },
      });
    })
  );

  // ✅ Populate for UI
  const populatedTeam = await Team.findById(team._id).populate("leader", "username").populate("members", "username");

  res.status(201).json({
    success: true,
    message: "Team created by admin and invitations sent",
    team: populatedTeam,
  });
});

exports.updateTeamByAdmin = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { name, leaderId, members = [] } = req.body;

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const oldLeaderId = team.leader.toString();
  const oldMembers = team.members.map((id) => id.toString());

  // Change team name
  if (name && team.name !== name) {
    team.name = name;
  }

  // Change leader if needed
  if (leaderId && leaderId !== oldLeaderId) {
    const newLeader = await User.findById(leaderId);
    const oldLeader = await User.findById(oldLeaderId);

    if (!newLeader) return res.status(404).json({ error: "New leader not found" });

    const teamLeaderRole = await Role.findOne({ name: "teamLeader" });
    const userRole = await Role.findOne({ name: "user" });
    if (!teamLeaderRole || !userRole) return res.status(500).json({ error: "Required roles not found" });

    // Assign teamLeader role to new leader
    newLeader.role = { id: teamLeaderRole._id, name: teamLeaderRole.name };
    newLeader.team = team._id;
    await newLeader.save({ validateBeforeSave: false });

    // Revert old leader to user role
    if (oldLeader) {
      oldLeader.role = { id: userRole._id, name: userRole.name };
      await oldLeader.save({ validateBeforeSave: false });

      await Notification.create({
        user: oldLeaderId,
        message: `You have been removed as leader of "${team.name}".`,
        type: "info",
        metadata: { teamId },
      });
    }

    team.leader = leaderId;

    await Notification.create({
      user: leaderId,
      message: `You are now the team leader of "${team.name}".`,
      type: "info",
      metadata: { teamId },
    });
  }

  // Members to invite (new members that aren't already part of the team)
  const newMemberIds = members.filter((id) => !oldMembers.includes(id) && id !== leaderId);

  const newMembers = await User.find({
    _id: { $in: newMemberIds },
    team: null,
  });

  for (const member of newMembers) {
    const notification = await Notification.create({
      user: member._id,
      message: `You have been invited to join the team "${team.name}" by an admin.`,
      type: "invite",
      metadata: {
        teamId,
        senderId: team.leader,
      },
    });

    await User.findByIdAndUpdate(member._id, {
      $push: { notifications: notification._id },
    });
  }

  // Members to remove (in old list but not in new)
  const removedMemberIds = oldMembers.filter((id) => !members.includes(id) && id !== oldLeaderId);

  for (const removedId of removedMemberIds) {
    await User.findByIdAndUpdate(removedId, { team: null });

    const notification = await Notification.create({
      user: removedId,
      message: `You have been removed from the team "${team.name}" by an admin.`,
      type: "info",
      metadata: { teamId },
    });

    await User.findByIdAndUpdate(removedId, {
      $push: { notifications: notification._id },
    });
  }

  // Finalize team update
  team.members = [team.leader, ...oldMembers.filter((id) => members.includes(id) && id !== team.leader.toString())];

  await team.save();

  const updatedTeam = await Team.findById(team._id).populate("leader", "username").populate("members", "username");

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    team: updatedTeam,
  });
});

exports.deleteTeamByAdmin = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  const leaderId = team.leader.toString();
  const memberIds = team.members.map((id) => id.toString()).filter((id) => id !== leaderId);

  // Notify members (except leader)
  const notifications = await Promise.all(
    memberIds.map(async (memberId) => {
      return Notification.create({
        user: memberId,
        message: `The team "${team.name}" has been deleted by an admin.`,
        type: "info",
        metadata: { teamId: team._id },
      });
    })
  );

  // Update member users
  await User.updateMany(
    { _id: { $in: memberIds } },
    {
      $set: { team: null },
      $push: {
        notifications: { $each: notifications.map((n) => n._id) },
      },
    }
  );

  // 🔥 Fetch "user" role
  const userRole = await Role.findOne({ name: "user" });
  if (!userRole) {
    return res.status(500).json({ error: "Role 'user' not found" });
  }

  // Update leader: remove team and downgrade role
  await User.findByIdAndUpdate(leaderId, {
    team: null,
    role: {
      id: userRole._id,
      name: userRole.name,
    },
  });

  // Delete team
  await Team.findByIdAndDelete(teamId);

  res.json({ message: `Team "${team.name}" deleted successfully by admin` });
});

exports.searchTeams = asyncHandler(async (req, res) => {
  const { name = "" } = req.query;

  // simple fuzzy search – adjust regex as needed
  const teams = await Team.find({
    name: { $regex: name, $options: "i" },
  })
    .select("_id name leader")           // return only what you need
    .populate("leader", "username");     // optional: show the leader

  res.status(200).json({
    status: "success",
    results: teams.length,
    data: teams,
  });
});