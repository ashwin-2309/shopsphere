const mongoose = require("mongoose");
const dotenv = require("dotenv");

// const mongoUri = process.env;
// console.log(mongoUri);
const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://ash2309:saymyname@cluster0.m4iiufd.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};

module.exports = connectDatabase;
