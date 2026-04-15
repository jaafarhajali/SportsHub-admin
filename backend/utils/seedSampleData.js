const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const Stadium = require("../models/stadiumModel");
const Academy = require("../models/academyModel");

const SAMPLE_USERS = [
  {
    username: "ahmad user",
    email: "ahmad@sportshub.com",
    password: "User@1234",
    phoneNumber: "+96171111111",
    roleName: "user",
  },
  {
    username: "sara user",
    email: "sara@sportshub.com",
    password: "User@1234",
    phoneNumber: "+96171111112",
    roleName: "user",
  },
  {
    username: "omar stadium",
    email: "omar.stadium@sportshub.com",
    password: "Owner@1234",
    phoneNumber: "+96172222221",
    roleName: "stadiumOwner",
  },
  {
    username: "layla stadium",
    email: "layla.stadium@sportshub.com",
    password: "Owner@1234",
    phoneNumber: "+96172222222",
    roleName: "stadiumOwner",
  },
  {
    username: "khaled academy",
    email: "khaled.academy@sportshub.com",
    password: "Owner@1234",
    phoneNumber: "+96173333331",
    roleName: "academyOwner",
  },
  {
    username: "nour academy",
    email: "nour.academy@sportshub.com",
    password: "Owner@1234",
    phoneNumber: "+96173333332",
    roleName: "academyOwner",
  },
];

const stadiumsFor = (ownerId, ownerLabel) => [
  {
    ownerId,
    name: `${ownerLabel} field 1`,
    location: "beirut",
    photos: [],
    pricePerMatch: 50000,
    maxPlayers: 10,
    penaltyPolicy: { hoursBefore: 24, penaltyAmount: 10000 },
    workingHours: { start: "15:00", end: "23:00" },
  },
  {
    ownerId,
    name: `${ownerLabel} field 2`,
    location: "tripoli",
    photos: [],
    pricePerMatch: 75000,
    maxPlayers: 12,
    penaltyPolicy: { hoursBefore: 12, penaltyAmount: 15000 },
    workingHours: { start: "16:00", end: "00:00" },
  },
];

const academyFor = (ownerId, ownerLabel, email) => ({
  ownerId,
  name: `${ownerLabel} football academy`,
  description: `Professional football training academy run by ${ownerLabel}.`,
  location: "beirut",
  phoneNumber: "+96170000000",
  email,
  photos: [],
});

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

(async () => {
  try {
    await mongoose.connect(DB);
    console.log("Connected to:", mongoose.connection.name);

    // Build a role lookup map
    const roles = await Role.find({});
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r._id]));
    for (const requiredRole of ["user", "stadiumOwner", "academyOwner"]) {
      if (!roleMap[requiredRole]) {
        throw new Error(
          `Role "${requiredRole}" missing. Run "npm run seed:admins" first.`
        );
      }
    }

    console.log("\n→ Seeding sample users...");
    const createdUsers = {};
    for (const u of SAMPLE_USERS) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        console.log(`  ✓ ${u.email} already exists`);
      } else {
        user = await User.create({
          username: u.username,
          email: u.email,
          password: u.password,
          passwordConfirm: u.password,
          phoneNumber: u.phoneNumber,
          termsAccepted: true,
          isVerified: true,
          isActive: true,
          role: { id: roleMap[u.roleName], name: u.roleName },
          authProvider: "local",
        });
        console.log(`  + created ${u.roleName.padEnd(14)} ${u.email}  (pw: ${u.password})`);
      }
      createdUsers[u.email] = user;
    }

    console.log("\n→ Seeding stadiums...");
    const stadiumOwners = SAMPLE_USERS.filter((u) => u.roleName === "stadiumOwner");
    for (const owner of stadiumOwners) {
      const ownerDoc = createdUsers[owner.email];
      const ownerLabel = owner.username.split(" ")[0];
      for (const s of stadiumsFor(ownerDoc._id, ownerLabel)) {
        const exists = await Stadium.findOne({
          ownerId: s.ownerId,
          name: s.name,
          location: s.location,
        });
        if (exists) {
          console.log(`  ✓ stadium "${s.name}" already exists`);
        } else {
          await Stadium.create(s);
          console.log(`  + stadium "${s.name}" for ${owner.email}`);
        }
      }
    }

    console.log("\n→ Seeding academies...");
    const academyOwners = SAMPLE_USERS.filter((u) => u.roleName === "academyOwner");
    for (const owner of academyOwners) {
      const ownerDoc = createdUsers[owner.email];
      const ownerLabel = owner.username.split(" ")[0];
      const data = academyFor(ownerDoc._id, ownerLabel, `${ownerLabel}.academy@sportshub.com`);
      const exists = await Academy.findOne({ email: data.email });
      if (exists) {
        console.log(`  ✓ academy "${data.name}" already exists`);
      } else {
        await Academy.create(data);
        console.log(`  + academy "${data.name}" for ${owner.email}`);
      }
    }

    console.log("\n✅ Sample data seeded.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    if (err.errors) {
      for (const k of Object.keys(err.errors)) {
        console.error("   -", k, ":", err.errors[k].message);
      }
    }
    process.exit(1);
  }
})();
