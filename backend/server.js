const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const bookRouter = require("./routes/book");
const path = require("path");

require("dotenv").config({ path: "./config/.env" });
require("./config/db");

const app = express();
// const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
// app.listen(process.env.PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });
