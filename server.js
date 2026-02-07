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
const multer = require("multer");
const authRoutes = require("./routes/auth");
const outfitRoutes = require("./routes/outfit");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required");
}

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

const createRateLimiter = ({ windowMs, max }) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    hits.set(key, entry);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil((entry.start + windowMs) / 1000)
    );

    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests" });
    }

    return next();
  };
};

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const sanitizeObject = (value) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
    } else {
      sanitizeObject(value[key]);
    }
  }
  return value;
};

app.use(apiLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
});
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Mongo error", err));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/outfit", outfitRoutes);

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS not allowed" });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === "Only image uploads are allowed") {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth");
const outfitRoutes = require("./routes/outfit");

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Mongo error", err));

app.use("/api/auth", authRoutes);
app.use("/api/outfit", outfitRoutes);

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



