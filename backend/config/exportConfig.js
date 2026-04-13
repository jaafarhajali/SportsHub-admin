module.exports = {
  users: {
    exclude: ["__v"],
    include: ["_id", "username", "email", "role", "phoneNumber", "isActive", "isVerified", "createdAt", "updatedAt"],
    populate: [{ path: "role", select: "name" }],
    transform: (item) => ({
      ...item,
      role: item.role?.name || "Unknown",
    }),
  },
  stadiums: {
    exclude: ["__v", "calendar", "photos", "ownerId"],
    populate: [{ path: "ownerId", select: "username" }],
    transform: (item) => {
      const { ownerId, ...rest } = item;

      // Move owner to second position
      const entries = Object.entries(rest);
      const [firstKey, firstValue] = entries[0]; // Usually _id
      const restEntries = entries.slice(1); // All others

      return Object.fromEntries([[firstKey, firstValue], ["owner", ownerId?.username || "Unknown"], ...restEntries]);
    },
  },
  bookings: {
    exclude: ["__v", "userId", "stadiumId", "isPaid"],
    populate: [
      { path: "userId", select: "username" },
      { path: "stadiumId", select: "name" },
    ],
    transform: (item) => {
      const { userId, stadiumId, ...rest } = item;

      // Move user and stadium after the _id column
      const entries = Object.entries(rest);
      const [firstKey, firstValue] = entries[0];
      const restEntries = entries.slice(1);

      return Object.fromEntries([
        [firstKey, firstValue],
        ["user", userId?.username || "N/A"],
        ["stadium", stadiumId?.name || "N/A"],
        ["price", item.price ?? 0],
        ...restEntries,
      ]);
    },
  },
  tournaments: {
    exclude: ["__v", "stadiumId"], // Exclude stadiumId so it doesn’t appear
    populate: [
      { path: "owner", select: "username" },
      { path: "stadiumId", select: "name" },
      { path: "teams", select: "name" },
      { path: "createdBy", select: "username" },
    ],
    transform: (item) => {
      const { stadiumId, teams, ...rest } = item;

      // Convert teams to array of team names
      const teamNames = Array.isArray(teams) ? teams.map((team) => team?.name || "Unnamed Team") : [];

      const entries = Object.entries(rest);
      const [firstKey, firstValue] = entries[0];
      const restEntries = entries.slice(1);

      return Object.fromEntries([
        [firstKey, firstValue],
        ["stadium", stadiumId?.name || "Unknown"],
        ...restEntries,
        ["teams", teamNames.join(", ")], // 👈 clean list of team names in one cell
        ["owner", item.owner?.username || "N/A"],
        ["createdBy", item.createdBy?.username || "N/A"],
      ]);
    },
  },
  teams: {
    exclude: ["__v"],
    populate: [
      { path: "leader", select: "username" },
      { path: "members", select: "username" },
    ],
    transform: (item) => ({
      ...item,
      leader: item.leader?.username || "N/A",
      members: item.members?.map((m) => m.username).join(", "),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A",
    }),
  },
  academies: {
    exclude: ["__v", "photos"],
    populate: [{ path: "ownerId", select: "username" }],
    transform: (item) => {
      const { ownerId, ...rest } = item;

      const entries = Object.entries(rest);
      const [firstKey, firstValue] = entries[0];
      const restEntries = entries.slice(1);

      return Object.fromEntries([[firstKey, firstValue], ["owner", ownerId?.username || "N/A"], ...restEntries]);
    },
  },
  roles: {
    exclude: ["__v"],
    populate: [
      { path: "createdBy", select: "username" },
      { path: "updatedBy", select: "username" },
    ],
    transform: (item) => ({
      ...item,
      createdBy: item.createdBy?.username || "Unknown",
      updatedBy: item.updatedBy?.username || "Unknown",
    }),
  },
};
