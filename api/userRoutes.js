const express = require("express");
const User = require("./userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("./authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Invalid credentials");
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).send("Invalid credentials");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ jwt: token });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/favs/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favs = user.favs;

    // Check if the favorite already exists in the list
    if (favs.includes(req.params.id)) {
      return res.status(400).send("Favorite already exists");
    }

    // Add the new favorite to the list
    user.favs.push(req.params.id);
    await user.save();

    res.json({ favs: user.favs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.delete("/favs/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favs = user.favs;

    // Check if the favorite already exists in the list
    if (!favs.includes(req.params.id)) {
      return res.status(400).send("Favorite does not exist");
    }

    // remove the new favorite to the list
    user.favs = favs.filter((favId) => favId !== req.params.id);
    await user.save();

    res.status(200).json({ message: "Favorite deleted", favs: user.favs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/favs", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ favs: user.favs });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
