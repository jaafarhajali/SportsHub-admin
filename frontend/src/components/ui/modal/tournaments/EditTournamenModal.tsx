'use client';
import React, { useState, useEffect } from "react";
import { Button } from "lebify-ui";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { toast } from "react-toastify";
import { addTeamToTournament, addTournament, getTournamentTeams, removeTeamFromTournament, updateTournament } from "@/lib/api/dashboard/tournaments";
import { getAllStadiums, getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";
import { useUser } from "@/context/UserContext";
import { Tournament } from "@/types/Tournament";
import { Team } from "@/types/Team";
import axios from "axios";
import { searchTeams } from "@/lib/api/dashboard/teams";

interface EditTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournament: Tournament | null;
    onUpdate: (updated: Tournament) => void;
}

const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
    isOpen,
    onClose,
    tournament,
    onUpdate,
}) => {
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        entryPricePerTeam: "",
        rewardPrize: "",
        maxTeams: "",
        startDate: "",
        endDate: "",
        stadiumId: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [stadiums, setStadiums] = useState([]);
    const [activeTab, setActiveTab] = useState<"info" | "teams">("info");
    const [currentTeams, setCurrentTeams] = useState<Team[]>([]);
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");



    useEffect(() => {
        if (tournament) {
            setFormData({
                name: tournament.name || "",
                description: tournament.description || "",
                entryPricePerTeam: tournament.entryPricePerTeam?.toString() || "",
                rewardPrize: tournament.rewardPrize?.toString() || "",
                maxTeams: tournament.maxTeams?.toString() || "",
                startDate: tournament.startDate?.split("T")[0] || "",
                endDate: tournament.endDate?.split("T")[0] || "",
                stadiumId: typeof tournament.stadiumId === "string" ? tournament.stadiumId : tournament.stadiumId?._id || "",
            });
        }
    }, [tournament]);

    useEffect(() => {
        async function fetchStadiums() {
            try {
                const ownerId = user?.id;
                console.log(ownerId);
                if (!ownerId) {
                    toast.error("No owner ID found.");
                    return;
                }

                const data = user?.role === 'admin'
                    ? await getAllStadiums()
                    : await getStadiumsByOwner(ownerId);

                setStadiums(data.data);
                console.log("Fetched stadiums:", data);

                if (data.length === 1) {
                    setFormData((prev) => ({ ...prev, stadiumId: data[0]._id }));
                    console.log("Auto-selected stadium ID:", data[0]._id);
                } else if (data.length === 0) {
                    console.warn("No stadiums found for this owner.");
                }
            } catch (error) {
                console.error("Failed to fetch stadiums", error);
                toast.error("Failed to fetch your stadium");
            }
        }

        if (isOpen) {
            fetchStadiums();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: any = {};

        // Validate required fields
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.entryPricePerTeam) newErrors.entryPricePerTeam = "Entry price is required";
        if (!formData.rewardPrize) newErrors.rewardPrize = "Reward prize is required";
        if (!formData.maxTeams) newErrors.maxTeams = "Max teams is required";
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (!formData.stadiumId) newErrors.stadiumId = "Stadium is required";

        // If any error exists, abort
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }
        // ✅ Date validation
        const now = new Date();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start < now) {
            toast.error("Start date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (end < now) {
            toast.error("End date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (end < start) {
            toast.error("End date cannot be before the start date.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const updated = await updateTournament(tournament!._id, formData);
            onUpdate(updated.data);
            onClose();
        } catch (err: any) {
            toast.error("Failed to update tournament");
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await searchTeams(query);
            setSearchResults(res.data); // assuming backend responds with { status, data: [...] }
        } catch (err) {
            toast.error("Search failed");
        }
    };


    const handleAddTeam = async (teamId: string) => {
        try {
            await addTeamToTournament(tournament?._id, teamId);
            toast.success("Team added");
            fetchTournamentTeams(); // re-fetch updated teams
        } catch (err) {
            toast.error("Failed to add team");
        }
    };

    const handleRemoveTeam = async (teamId: string) => {
        try {
            await removeTeamFromTournament(tournament?._id, teamId);
            toast.success("Team removed");
            fetchTournamentTeams();
        } catch (err) {
            toast.error("Failed to remove team");
        }
    };

    const fetchTournamentTeams = async () => {
        if (!tournament?._id) return;

        try {
            const res = await getTournamentTeams(tournament._id);
            setCurrentTeams(res.data);  // assuming your backend response shape: { status, data }
        } catch (err) {
            toast.error("Failed to fetch tournament teams");
        }
    };


    useEffect(() => {
        if (isOpen && tournament && activeTab === "teams") {
            fetchTournamentTeams();
        }
    }, [isOpen, tournament, activeTab]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400); // adjust delay here (ms)

        return () => {
            clearTimeout(handler); // cancel if user keeps typing
        };
    }, [searchQuery]);

    useEffect(() => {
        const fetchSearch = async () => {
            if (!debouncedQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await searchTeams(debouncedQuery);
                setSearchResults(res.data);
            } catch (err) {
                toast.error("Search failed");
            }
        };

        fetchSearch();
    }, [debouncedQuery]);



    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-xl w-full">
                <h2 className="text-xl font-semibold pb-6 dark:text-white">Edit Tournament</h2>
                <div className="flex border-b mb-4">
                    <button
                        className={`px-4 py-2 ${activeTab === "info" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
                        onClick={() => setActiveTab("info")}
                    >
                        Tournament Info
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === "teams" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
                        onClick={() => setActiveTab("teams")}
                    >
                        Manage Teams
                    </button>
                </div>
                {activeTab === "info" && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label>Name</Label>
                            <Input name="name" defaultValue={formData.name} onChange={handleChange} />
                            {errors.name && <FieldError message={errors.name} />}
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input name="description" defaultValue={formData.description} onChange={handleChange} />
                            {errors.description && <FieldError message={errors.description} />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Entry Price Per Team</Label>
                                <Input name="entryPricePerTeam" defaultValue={formData.entryPricePerTeam} onChange={handleChange} />
                                {errors.entryPricePerTeam && <FieldError message={errors.entryPricePerTeam} />}
                            </div>
                            <div>
                                <Label>Reward Prize</Label>
                                <Input name="rewardPrize" defaultValue={formData.rewardPrize} onChange={handleChange} />
                                {errors.rewardPrize && <FieldError message={errors.rewardPrize} />}
                            </div>
                        </div>
                        <div>
                            <Label>Max Teams</Label>
                            <Input name="maxTeams" defaultValue={formData.maxTeams} onChange={handleChange} />
                            {errors.maxTeams && <FieldError message={errors.maxTeams} />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" name="startDate" defaultValue={formData.startDate} onChange={handleChange} />
                                {errors.startDate && <FieldError message={errors.startDate} />}
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" name="endDate" defaultValue={formData.endDate} onChange={handleChange} />
                                {errors.endDate && <FieldError message={errors.endDate} />}
                            </div>
                        </div>
                        <div>
                            <Label>Stadium</Label>
                            <select
                                name="stadiumId"
                                value={formData.stadiumId}
                                onChange={handleChange}
                                className="w-full rounded border px-3 py-2 placeholder:text-gray-400 dark:bg-stone-950 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                            >
                                <option value="">Select a stadium</option>
                                {stadiums.map((stadium: any) => (
                                    <option key={stadium._id} value={stadium._id}>
                                        {stadium.name}
                                    </option>
                                ))}
                            </select>
                            {errors.stadiumId && <FieldError message={errors.stadiumId} />}
                        </div>
                        <Button type="submit" variant="sea" loading={loading} className="w-full">
                            Update Tournament
                        </Button>
                    </form>
                )}

                {activeTab === "teams" && (
                    <div className="space-y-4">
                        {/* Search input */}
                        <input
                            type="text"
                            placeholder="Search team by name"
                            className="w-full rounded border px-3 py-2"
                            onChange={(e) => setSearchQuery(e.target.value)}

                        />

                        {/* Current teams list */}
                        <ul className="space-y-2">
                            {currentTeams.map((team) => (
                                <li key={team._id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                    <span>{team.name}</span>
                                    <button onClick={() => handleRemoveTeam(team._id)} className="text-red-500 hover:text-red-700">
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* (Optional) Search results list */}
                        {searchResults.map((team) => (
                            <div key={team._id} className="flex justify-between items-center bg-white p-2 border rounded">
                                <span>{team.name}</span>
                                <button onClick={() => handleAddTeam(team._id)} className="text-green-600 hover:text-green-800">
                                    ➕ Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default EditTournamentModal;
