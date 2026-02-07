const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const trimmedUsername = username?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!trimmedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password muy corta" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.json({ message: "Usuario creado" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email ya registrado" });
    }
    res.status(500).json({ error: "Error al registrar" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch {
    res.status(500).json({ error: "Error login" });
  }
});

module.exports = router;
