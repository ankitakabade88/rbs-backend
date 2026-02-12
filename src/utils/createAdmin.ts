import User from "../models/user.model";

export const createDefaultAdmin = async () => {
  const adminEmail = "chikku@test.com";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  await User.create({
    name: "Admin",
    email: adminEmail,
    password: "Admin@123", 
    role: "admin",
  });

  console.log("Default admin created");
};
