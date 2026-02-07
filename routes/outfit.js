const express = require("express");
const Outfit = require("../models/Outfit");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// 📤 CREAR OUTFIT CON IMAGEN
router.post(
  "/",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const description = req.body.description?.trim();
      if (description && description.length > 500) {
        return res.status(400).json({ error: "Descripción demasiado larga" });
      }

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "outfits" }
      );

      const outfit = await Outfit.create({
        imageUrl: result.secure_url,
        description,
        user: req.userId,
      });

      res.json(outfit);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// 📥 OBTENER OUTFITS
router.get("/", auth, async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.userId });
    res.json(outfits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching outfits" });
  }
});

module.exports = router;



