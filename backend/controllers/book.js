const fs = require("fs").promises;
const { log } = require("console");
const Book = require("../models/Book");
const path = require("path");

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
      imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
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
exports.getBestRatedBooks = async (req, res) => {
  try {
    // Trouver les 3 livres avec la meilleure note moyenne
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);

    res.status(200).json(books);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des livres avec les meilleurs notes.",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des livres avec les meilleurs notes.",
    });
  }
};

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
    const filePath = `images/${filename}`; // Chemin relatif

    // Supprimer le fichier de l'image
    try {
      await fs.unlink(filePath);
      console.log("Image supprimée avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression de l'image:", err);
    }
    // Supprimer le livre de la base de données
    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Livre supprimé avec succès!" });
  } catch (error) {
    console.error("Erreur lors de la suppression du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du livre." });
  }
};
exports.modifyBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const updatedBookData = { ...JSON.parse(req.body.book) };

    if (req.file) {
      // Supprimer l'ancienne image si une nouvelle est fournie
      const oldImageFilename = path.basename(book.imageUrl);
      const oldImagePath = path.normalize(
        path.join("images", oldImageFilename)
      );
      console.log("Ancien chemin de fichier:", oldImagePath);

      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.error(
          "Erreur lors de la suppression de l'ancienne image:",
          err
        );
      }
      updatedBookData.imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/images/${path.basename(req.file.path)}`;
    }
    //  else {
    //   updatedBookData.imageUrl = book.imageUrl;
    // }
    console.log("Nouvelle URL de l'image:", updatedBookData.imageUrl);
    // Mettre à jour le livre avec les nouvelles données
    const updateResult = await Book.updateOne(
      { _id: req.params.id },
      { ...updatedBookData }
    );
    console.log("Livre modifié avec succès:", updateResult);
    const updatedBook = await Book.findById(req.params.id);

    res
      .status(200)
      .json({ message: "Livre modifié avec succès!", book: updatedBook });
  } catch (error) {
    console.error("Erreur lors de la modification du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du livre." });
  }
};
exports.postRating = async (req, res) => {
  try {
    // Récupérer
    const userId = req.auth.userId;
    const rating = req.body.rating;
    const id = req.params.id;
    // Vérifier si l'ID du livre est valide
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "ID de livre non valide." });
    }
    // Rechercher le livre par ID
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }
    // Vérifier si l'utilisateur a déjà noté ce livre
    const alreadyRating = book.ratings.find((r) => r.userId === userId);
    if (alreadyRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }
    // Ajouter la nouvelle note à la liste des notes du livre
    const newRating = { userId: userId, grade: rating };
    book.ratings.push(newRating);

    // Calculer la nouvelle moyenne des notes
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    book.averageRating = sumRatings / totalRatings;
    // Sauvegarder les modifications du livre dans la base de données
    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la note du livre :", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de la note du livre.",
    });
  }
};
