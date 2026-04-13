"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Button } from "lebify-ui";
import { Users, Crown, Search, UserPlus, Trash2, LogOut, Trophy, Shield } from "lucide-react";
// Note: axios import would need to be available in your actual project
import axios from "axios";
import { toast } from "react-toastify";
import teamService from "@/lib/api/team";

export default function TeamInfoCard() {
  const { user, refreshUser } = useUser();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [searchType, setSearchType] = useState("username");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    refreshUser();
    fetchTeam();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchType]);

  async function fetchTeam() {
    try {
      setLoading(true);
      const data = await teamService.fetchTeam();
      setTeam(data.team);
      setInvitedUsers(data.team?.members || []);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setTeam(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return alert("Please enter a team name");
    try {
      setLoading(true);
      const response = await teamService.createTeam(newTeamName);
      toast.success("Team created!");
      setShowCreateModal(false);
      setNewTeamName("");
      localStorage.setItem("token", response.token);
      fetchTeam();
      refreshUser();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    if (!searchQuery.trim()) return;
    try {
      const data = await teamService.searchUsers(searchType, searchQuery);
      setSearchResults(data.users);
    } catch (error) {
      toast.error("Search failed");
    }
  }

  async function inviteUser(userId: string) {
    try {
      await teamService.inviteUser(userId, team?._id);
      toast.success("User invited!");
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      toast.error("Failed to invite user");
    }
  }

  async function removeUser(userId: string) {
    try {
      await teamService.removeUser(userId, team?._id);
      toast.success("User removed!");
      fetchTeam();
    } catch (error) {
      toast.error("Failed to remove user");
    }
  }

  async function deleteTeam() {
    if (!confirm("Are you sure you want to dissolve the team?")) return;
    try {
      const response = await teamService.deleteTeam(team?._id);
      toast.success("Team dissolved");
      localStorage.setItem('token', response.token);
      setTeam(null);
      refreshUser();
    } catch (error) {
      toast.error("Failed to delete team");
    }
  }

  async function exitTeam() {
    if (!confirm("Are you sure you want to leave the team?")) return;
    try {
      const response = await teamService.exitTeam(team?._id);
      toast.success("You left the team");
      localStorage.setItem("token", response.token);
      setTeam(null);
      refreshUser();
    } catch (error) {
      toast.error("Failed to exit team");
    }
  }

  const getPositionColor = (index) => {
    const colors = [
      "from-yellow-400 to-yellow-600", // Captain
      "from-blue-500 to-blue-700",
      "from-green-500 to-green-700",
      "from-purple-500 to-purple-700",
      "from-red-500 to-red-700",
      "from-indigo-500 to-indigo-700",
      "from-pink-500 to-pink-700",
      "from-orange-500 to-orange-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-stone-800 rounded-3xl border border-gray-200 dark:border-stone-700">
      {/* Football field pattern background */}


      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Team Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your football squad</p>
            </div>
          </div>

          {!team ? (
            <Button
              variant="sea"
              onClick={() => {
                if (user?.role !== "user" && user?.role !== "teamLeader") {
                  toast.error("Access denied: You must be a user to perform this action.");
                  return;
                }

                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Create Team
            </Button>
          ) : user?.id === team.leader ? (
            <Button
              variant="sea"
              onClick={deleteTeam}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="sea"
              buttonType="outlined"
              onClick={exitTeam}
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : team ? (
          <div className="space-y-8">
            {/* Team Info */}
            <div className="bg-gray-100 dark:bg-stone-800 rounded-2xl p-6 border border-gray-300 dark:border-stone-600">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{team.name}</h3>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {team.members.length} Players in Squad
                </span>
              </div>
            </div>

            {/* Squad Formation */}
            <div className="bg-gray-100 dark:bg-stone-800 rounded-2xl p-6 border border-gray-300 dark:border-stone-600">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-500" />
                Squad Formation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
                {team.members.map((member, index) => (
                  <div
                    key={member._id}
                    className={`relative bg-gradient-to-r ${getPositionColor(index)} p-1 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300`}
                  >
                    <div className="bg-white dark:bg-stone-900 rounded-xl p-4 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {member._id === team.leader && (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          )}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
                            {index + 1}
                          </div>
                        </div>
                        {user?.id === team?.leader && member?._id !== user?.id && (
                          <button
                            onClick={() => removeUser(member._id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">
                          {member.username}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member._id === team.leader ? 'Captain' : `Player #${index + 1}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scout New Players */}
            {user.id === team.leader && (
              <div className="bg-gray-100 dark:bg-stone-800 rounded-2xl p-6 border border-gray-300 dark:border-stone-600">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  Scout New Players
                </h3>

                <div className="space-y-4 mt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="username">Username</option>
                      <option value="email">Email</option>
                      <option value="phoneNumber">Phone</option>
                    </select>

                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder={`Search players by ${searchType}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-3 rounded-xl border-gray-300 dark:border-stone-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Available Players:</h4>
                      {searchResults.map((usr) => (
                        <div
                          key={usr._id}
                          className="flex items-center justify-between p-4 mt-3 bg-gray-200/50 dark:bg-stone-800 rounded-xl border border-gray-300 dark:border-stone-600 hover:shadow-md transition-all"
                        >
                          <div className="space-y-1">
                            <h5 className="font-semibold text-gray-800 dark:text-white">{usr.username}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {usr.email} • {usr.phoneNumber}
                            </p>
                          </div>
                          <Button
                            onClick={() => inviteUser(usr._id)}
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <UserPlus className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No players found matching your search</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Ready to Build Your Team?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 mx-auto">
              You&apos;re not part of any team yet. Create your own squad and <br /> start recruiting the best players!
            </p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} className="max-w-md">
        <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Create Your Team</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Give your squad a legendary name</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Team Name</Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter your team name..."
                className="mt-2 py-3 rounded-xl border-gray-300 dark:border-stone-600 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                buttonType="outlined"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={createTeam}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg"
              >
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}