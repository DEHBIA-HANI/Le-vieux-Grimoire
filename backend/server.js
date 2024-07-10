const express = require("express");
const cors = require("cors");
const router = require("./routes/user");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", router);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
