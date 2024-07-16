const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");
const router = express.Router();

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getBookById);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.put("/:id", auth, bookCtrl.modifyBook);
module.exports = router;
