const User = require("../models/userModel");
const Team = require("../models/teamModel");
const Role = require("../models/roleModel");
const Notification = require("../models/notificationModel");
const asyncHandler = require("express-async-handler");

// Create team
exports.createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const leaderId = req.user.id;

  const user = await User.findById(leaderId);
  if (user.team) {
    return res.status(400).json({ error: "You already have a team" });
  }

  const team = await Team.create({
    name,
    leader: leaderId,
    members: [leaderId],
  });

  // 🔥 Fetch the Role document
  const teamLeaderRole = await Role.findOne({ name: "teamLeader" });
  if (!teamLeaderRole) {
    return res.status(500).json({ error: "Role 'teamLeader' not found in database" });
  }

  await User.findByIdAndUpdate(leaderId, {
    role: {
      id: teamLeaderRole._id,
      name: teamLeaderRole.name,
    },
    team: team._id,
  });
  const updatedUser = await User.findById(leaderId); // or leaderId
  const newToken = updatedUser.getSignedJwtToken();
  res.status(201).json({ message: "Team created", team, token: newToken });
});

// Search user
exports.searchUser = asyncHandler(async (req, res) => {
  const { keyword, field } = req.query;
  if (!["username", "email", "phoneNumber"].includes(field)) {
    return res.status(400).json({ error: "Invalid search field" });
  }

  const regex = new RegExp(keyword, "i");
  const users = await User.find({ [field]: regex }).limit(10);

  if (users.length === 0) {
    return res.status(404).json({ error: "No users found" });
  }

  res.json({ users });
});

// Invite user
exports.inviteUser = asyncHandler(async (req, res) => {
  const { userIdToInvite, teamId } = req.body;
  const sender = await User.findById(req.user.id);
  const invitedUser = await User.findById(userIdToInvite);

  if (!invitedUser) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.create({
    user: userIdToInvite,
    message: `${sender.username} invited you to join their team`,
    type: "invite",
    metadata: {
      teamId,
      senderId: sender._id,
    },
  });

  await User.findByIdAndUpdate(userIdToInvite, {
    $push: { notifications: notification._id },
  });

  res.status(200).json({ message: "Invitation sent" });
});

// Accept invitation
exports.acceptInvite = asyncHandler(async (req, res) => {
  const { teamId, notificationId } = req.body;
  const userId = req.user.id;

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  if (team.members.includes(userId)) {
    return res.status(400).json({ error: "You’re already in this team" });
  }

  // Fetch the original notification BEFORE deleting it
  const originalNotif = await Notification.findById(notificationId);
  const senderId = originalNotif?.metadata?.senderId;

  // Add user to team
  team.members.push(userId);
  await team.save();
  await User.findByIdAndUpdate(userId, { team: team._id });

  // Remove notification from user's list and delete it
  await User.findByIdAndUpdate(userId, {
    $pull: { notifications: notificationId },
  });
  await Notification.findByIdAndDelete(notificationId);

  // Notify the sender
  if (senderId) {
    const acceptingUser = await User.findById(userId);
    const newNotif = await Notification.create({
      user: senderId,
      message: `${acceptingUser.username} accepted your team invitation`,
      type: "info",
      metadata: {
        acceptedUserId: userId,
        teamId: team._id,
      },
    });

    await User.findByIdAndUpdate(senderId, {
      $push: { notifications: newNotif._id },
    });
  }

  const updatedUser = await User.findById(userId);
  const newToken = updatedUser.getSignedJwtToken();

  res.json({ message: "Joined team successfully", token: newToken });
});

// Reject invitation
exports.rejectInvite = asyncHandler(async (req, res) => {
  const { notificationId } = req.body;
  const userId = req.user.id;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  // Only allow user to reject their own invitations
  if (notification.user.toString() !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Fetch senderId from the original notification BEFORE deleting
  const senderId = notification.metadata?.senderId;

  // Remove notification from user's array
  await User.findByIdAndUpdate(userId, {
    $pull: { notifications: notificationId },
  });

  // Delete the notification document
  await Notification.findByIdAndDelete(notificationId);

  // Notify the sender about the rejection
  if (senderId) {
    const rejectingUser = await User.findById(userId);
    const newNotif = await Notification.create({
      user: senderId,
      message: `${rejectingUser.username} rejected your team invitation`,
      type: "info",
      metadata: {
        rejectedUserId: userId,
        // optionally include teamId if you want, e.g. notification.metadata.teamId
        teamId: notification.metadata?.teamId,
      },
    });

    await User.findByIdAndUpdate(senderId, {
      $push: { notifications: newNotif._id },
    });
  }

  res.json({ message: "Invitation rejected" });
});

// Remove user from team
exports.removeMember = asyncHandler(async (req, res) => {
  const { userIdToRemove, teamId } = req.body;
  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  if (team.leader.toString() !== req.user.id) {
    return res.status(403).json({ error: "Only team leader can remove members" });
  }

  team.members = team.members.filter((id) => id.toString() !== userIdToRemove);
  await team.save();

  await User.findByIdAndUpdate(userIdToRemove, { team: null });

  // Create notification for the removed user
  const removedUser = await User.findById(userIdToRemove);
  if (removedUser) {
    const notification = await Notification.create({
      user: userIdToRemove,
      message: `You have been removed from the team "${team.name}"`,
      type: "info",
      metadata: {
        teamId: team._id,
      },
    });

    await User.findByIdAndUpdate(userIdToRemove, {
      $push: { notifications: notification._id },
    });
  }

  const updatedUser = await User.findById(userIdToRemove); // or leaderId
  const newToken = updatedUser.getSignedJwtToken();
  res.json({ message: "User removed from team", token: newToken });
});

// Get current user's team info
exports.getMyTeam = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find the user to get the team ID
  const user = await User.findById(userId).populate({
    path: "team",
    populate: { path: "members", select: "username email phoneNumber role" }, // populate members with basic info
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.team) {
    return res.status(404).json({ error: "You do not belong to any team" });
  }

  res.json({ team: user.team });
});

// Delete team (leader only)
exports.deleteTeam = asyncHandler(async (req, res) => {
  const leaderId = req.user.id;
  const team = await Team.findOne({ leader: leaderId });

  if (!team) return res.status(404).json({ error: "Team not found or you are not the leader" });

  // Notify all members (except leader) about deletion
  const memberIds = team.members.filter((id) => id.toString() !== leaderId);

  const notifications = await Promise.all(
    memberIds.map(async (memberId) => {
      return Notification.create({
        user: memberId,
        message: `The team "${team.name}" has been deleted by the leader.`,
        type: "info",
        metadata: { teamId: team._id },
      });
    })
  );

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
    return res.status(500).json({ error: "Role 'user' not found in database" });
  }

  // Remove team reference from leader and downgrade role
  await User.findByIdAndUpdate(leaderId, {
    team: null,
    role: {
      id: userRole._id,
      name: userRole.name,
    },
  });

  // Delete the team
  await Team.findByIdAndDelete(team._id);

  const updatedUser = await User.findById(leaderId); // or leaderId
  const newToken = updatedUser.getSignedJwtToken();
  res.json({ message: "Team deleted successfully", token: newToken });
});

// Exit team (members only)
exports.exitTeam = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user.team) {
    return res.status(400).json({ error: "You are not in a team" });
  }

  const team = await Team.findById(user.team);
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  if (team.leader.toString() === userId) {
    return res.status(403).json({ error: "Team leader cannot exit the team. Delete it instead." });
  }

  // Remove user from team
  team.members = team.members.filter((memberId) => memberId.toString() !== userId);
  await team.save();

  await User.findByIdAndUpdate(userId, { team: null });

  // Notify the leader
  const notification = await Notification.create({
    user: team.leader,
    message: `${user.username} has left your team "${team.name}".`,
    type: "info",
    metadata: {
      teamId: team._id,
      userId,
    },
  });

  await User.findByIdAndUpdate(team.leader, {
    $push: { notifications: notification._id },
  });

  const updatedUser = await User.findById(userId); // or leaderId
  const newToken = updatedUser.getSignedJwtToken();
  res.json({ message: "You have left the team", token: newToken });
});
