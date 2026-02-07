const mongoose = require("mongoose");

const OutfitSchema = new mongoose.Schema({
  imageUrl: String,
  description: String,
  createdAt: { type: Date, default: Date.now },

  // 🔑 CLAVE DEL PASO 11
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Outfit", OutfitSchema);


module.exports = mongoose.model("Outfit", OutfitSchema);

