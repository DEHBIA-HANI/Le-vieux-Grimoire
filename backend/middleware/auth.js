const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupérer le token de l'en-tête Authorization
    const token = req.headers.authorization.split(" ")[1];
    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Ajouter l'userId décodé à la requête pour l'utiliser dans les contrôleurs
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentification échouée." });
  }
};
