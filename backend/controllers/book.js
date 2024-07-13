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
    console.log("Requête reçue:", req.body);
    console.log("Fichier reçu:", req.file);
    const bookData = JSON.parse(req.body.book);
    console.log("Données du livre analysées:", bookData);
    const { userId, title, author, year, genre, ratings, averageRating } =
      bookData;
    // Création de l'objet livre
    const newBook = new Book({
      userId,
      title,
      author,
      year,
      genre,
      userId: req.auth.userId,
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
