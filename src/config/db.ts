import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected successfully");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;



/*Load environment variables
Connect to MongoDB using Mongoose
Log success or failure
Exit the process  */

//DB CONNECTION LAYER