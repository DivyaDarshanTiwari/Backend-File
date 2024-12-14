const connectDB = async (mongodb) => {
  try {
    await mongodb.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Check the MongoDB coonection file for the error");
    console.log(error);
  }
};

module.exports = connectDB;
