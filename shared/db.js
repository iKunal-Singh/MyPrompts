const mongoose = require('mongoose');

const connectDB = async (serviceName = 'Service') => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_prompt_manager';

  if (!MONGODB_URI) {
    console.error(`[${serviceName}] MONGODB_URI is not defined. Please set it in the .env file.`);
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // Not supported in Mongoose 6+
      // useFindAndModify: false, // Not supported in Mongoose 6+
    });
    console.log(`[${serviceName}] MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[${serviceName}] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(`[${serviceName}] MongoDB disconnected.`);
    });

  } catch (error) {
    console.error(`[${serviceName}] MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
