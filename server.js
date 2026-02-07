require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const outfitRoutes = require("./routes/outfit");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI env var");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET env var");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ Mongo error", err);
    process.exit(1);
  });

app.use("/api/outfit", outfitRoutes);
app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error", err);
  res.status(500).json({ error: "Unexpected error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception", err);
  process.exit(1);
});



