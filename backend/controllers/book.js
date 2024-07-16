const fs = require("fs");
const Book = require("../models/Book");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Récupérer tous les livres de la base de données
    res.status(200).json(books);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des livres" });
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const { userId, title, author, year, genre, ratings, averageRating } =
      bookData;
    // Création de l'objet livre
    const newBook = new Book({
      userId,
      title,
      author,
      year,
      genre,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      ratings: ratings || [],
      averageRating: averageRating || 0,
    });
    await newBook.save();

    res.status(201).json({ message: "Livre enregistré avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement du livre." });
  }
};
// Récupérer un livre par son ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Erreur lors de la récupération du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du livre." });
  }
};
// exports.getBestRatedBooks = async (req, res) => {
//   try {
//     // Trouver les 3 livres avec la meilleure note moyenne
//     const books = await Book.find().sort({ averageRating: -1 }).limit(3);
//     res.status(200).json(books);
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération des livres avec les meilleurs notes.",
//       error
//     );
//     res
//       .status(500)
//       .json({
//         message:
//           "Erreur lors de la récupération des livres avec les meilleurs notes.",
//       });
//   }
// };

// Supprimer un livre par son ID
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la suppression de l'image" });
      }
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Livre supprimé avec succès!" });
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du livre." });
  }
};
exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete bookObject.userId;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (req.file) {
      // Supprimer l'ancienne image si une nouvelle est fournie
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err)
          console.error(
            "Erreur lors de la suppression de l'ancienne image:",
            err
          );
      });
    }
    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );
    res.status(200).json({ message: "Livre modifié avec succès!" });
  } catch (error) {
    console.error("Erreur lors de la modification du livre:", error);
    res.status(500).send("Erreur lors de la modification du livre.");
  }
};
