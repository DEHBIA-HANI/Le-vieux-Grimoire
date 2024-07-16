const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");
const router = express.Router();

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getBookById);

// router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.delete("/:id", auth, bookCtrl.deleteBook);
module.exports = router;
