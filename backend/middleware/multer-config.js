const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

// Définir les types MIME supportés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, `${name}_${Date.now()}.${extension}`);
  },
});

// Middleware multer pour gérer le téléchargement d'un seul fichier avec le champ 'image'
const upload = multer({ storage }).single("image");

// Middleware pour redimensionner l'image après le téléchargement
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    console.log("Aucun fichier uploadé.");
    return next();
  }

  try {
    const filePath = req.file.path;
    const filename = req.file.filename;
    const outputPath = path.join(
      "images",
      `resized_${path.parse(filename).name}.webp`
    );

    console.log("Redimensionnement de l'image en cours...");
    await sharp(filePath)
      .resize({ width: 200, height: 260, fit: "cover" })
      .toFormat("webp")
      .toFile(outputPath);

    console.log(
      "Image redimensionnée avec succès, tentative de suppression du fichier original..."
    );

    // Vérifier l'accès au fichier avant de le supprimer
    try {
      await fs.access(filePath); // Vérifie si le fichier est accessible
      await fs.unlink(filePath);
      console.log("Fichier original supprimé avec succès.");
    } catch (accessError) {
      console.error("Erreur d'accès au fichier:", accessError);
    }

    req.file.path = outputPath.replace(/\\/g, "/");
    req.file.filename = path.basename(outputPath);

    next();
  } catch (error) {
    console.error("Erreur lors du redimensionnement de l'image:", error);
    next(error);
  }
};

module.exports = { upload, resizeImage };
