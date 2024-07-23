const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises; // Utilisation de la version promises de fs pour une gestion des erreurs plus propre

// Définir les types MIME supportés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  // Définir le répertoire de destination pour les fichiers téléchargés
  destination: (req, file, callback) => {
    callback(null, "images"); // Répertoire de stockage des images
  },

  // Définir le nom du fichier
  filename: (req, file, callback) => {
    // Remplacer les espaces par des underscores et générer un nom unique en ajoutant un timestamp
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype]; // Obtenir l'extension basée sur le type MIME
    callback(null, `${name}_${Date.now()}.${extension}`); // Nom du fichier final
  },
});

// Middleware multer pour gérer le téléchargement d'un seul fichier avec le champ 'image'
const upload = multer({ storage }).single("image");

// Middleware pour redimensionner l'image après le téléchargement
const resizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Aucun fichier téléchargé.");
    }

    const filePath = req.file.path; // Chemin du fichier d'origine
    const filename = req.file.filename; // Nom du fichier d'origine
    const outputPath = path.join(
      "images",
      `resized_${path.parse(filename).name}.webp`
    );

    // Redimensionner l'image
    await sharp(filePath)
      .resize({ width: 200, height: 260, fit: "cover" }) // Dimensions et ajustement de l'image
      .toFormat("webp")
      .toFile(outputPath), // Stocker l'image redimensionnée
      // Supprimer l'image d'origine
      await fs.unlink(filePath);

    // Mettre à jour le chemin du fichier dans la requête pour pointer vers l'image redimensionnée
    req.file.path = outputPath.replace(/\\/g, "/");

    next();
  } catch (error) {
    console.error("Erreur lors du redimensionnement de l'image:", error);
    next(error);
  }
};

module.exports = { upload, resizeImage };
