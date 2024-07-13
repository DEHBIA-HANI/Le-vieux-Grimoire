const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const bookRouter = require("./routes/book");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
