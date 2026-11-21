import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse connection in serverless environment
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('[MongoDB Warning]: MONGODB_URI is not defined in environment variables.');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

export default connectDB;
