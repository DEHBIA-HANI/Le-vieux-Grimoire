const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");
const router = express.Router();
// Route pour récupérer tous les livres
router.get("/", bookCtrl.getAllBooks);
// Route pour ajouter un livre
router.post("/", auth, multer, bookCtrl.createBook);
module.exports = router;
