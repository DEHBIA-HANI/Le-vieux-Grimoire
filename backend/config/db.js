const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_PASS +
      "@" +
      process.env.CLUSTER +
      ".mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connection à MongoDB réussie !"))
  .catch((error) => console.log("Failed to connect to MongoDB", error));
