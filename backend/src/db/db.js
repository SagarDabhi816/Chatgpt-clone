const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Databse Is Connected");
  });
  } catch (error) {
    console.error("Error while connected to Databse",error)
  }
}

module.exports = connectToDB;
