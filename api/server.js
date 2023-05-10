const express = require("express");
const userRoutes = require("./userRoutes");
const db = require("./db");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

db.connect();

app.use(userRoutes);

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
