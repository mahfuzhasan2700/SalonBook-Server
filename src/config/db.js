import mongoose from 'mongoose';

let connectionPromise = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is currently in-flight, await that exact promise
  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('[MongoDB Warning]: MONGODB_URI is not defined in environment variables.');
      return;
    }

    connectionPromise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });

    const conn = await connectionPromise;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    connectionPromise = null;
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

export default connectDB;
