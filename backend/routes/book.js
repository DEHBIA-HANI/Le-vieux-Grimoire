const express = require("express");
const auth = require("../middleware/auth");
const { upload, resizeImage } = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");
const router = express.Router();

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, upload, resizeImage, bookCtrl.createBook);

router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getBookById);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.put("/:id", auth, upload, resizeImage, bookCtrl.modifyBook);
router.post("/:id/rating", auth, bookCtrl.postRating);

module.exports = router;
