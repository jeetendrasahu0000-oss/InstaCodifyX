// Backend/resetAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./Models/Admin.js";

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Admin.deleteMany({});
  await Admin.create({
    username: "superadmin",
    email: "admin@codifyx.com",
    password: "codifyx@123",
    role: "admin",
  });
  console.log("✅ Admin reset done!");
  process.exit();
};

reset();
