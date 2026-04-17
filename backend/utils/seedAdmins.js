const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/roleModel");
const User = require("../models/userModel");

const ROLES = ["admin", "user", "stadiumOwner", "academyOwner", "teamLeader", "referee"];

const ADMINS = [
  {
    username: "super admin",
    email: "admin@sportshub.com",
    password: "Admin@1234",
    phoneNumber: "+96170000001",
  },
  {
    username: "jaafar admin",
    email: "jaafarhajali33@gmail.com",
    password: "Admin@1234",
    phoneNumber: "+96170000002",
  },
];

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

(async () => {
  try {
    await mongoose.connect(DB);
    console.log("Connected to:", mongoose.connection.name);

    console.log("\n→ Seeding roles...");
    for (const name of ROLES) {
      const existing = await Role.findOne({ name });
      if (existing) {
        console.log(`  ✓ role "${name}" already exists`);
      } else {
        await Role.create({ name });
        console.log(`  + created role "${name}"`);
      }
    }

    const adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) throw new Error("Admin role missing after seed");

    console.log("\n→ Seeding admin users...");
    for (const a of ADMINS) {
      const existing = await User.findOne({ email: a.email });
      if (existing) {
        console.log(`  ✓ user ${a.email} already exists — skipping`);
        continue;
      }

      await User.create({
        username: a.username,
        email: a.email,
        password: a.password,
        passwordConfirm: a.password,
        phoneNumber: a.phoneNumber,
        termsAccepted: true,
        isVerified: true,
        isActive: true,
        role: { id: adminRole._id, name: "admin" },
        authProvider: "local",
      });
      console.log(`  + created admin ${a.email}  (password: ${a.password})`);
    }

    console.log("\n✅ Seed complete.");
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
