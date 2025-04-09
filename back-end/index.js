require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moviesRoute = require("./routes/movies");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const protectedRoutes = require("./routes/protectedRoutes");
const createGroupRoutes = require("./routes/creategroup");
const searchGroupRoutes = require("./routes/searchgroup");
const profileGroupRoutes = require("./routes/profilegroup");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); 

app.use("/api/movies", moviesRoute);
app.use("/api/auth", authRoutes); 
app.use("/api/contact", contactRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/createGroup", createGroupRoutes);
app.use("/api/searchGroup", searchGroupRoutes);
app.use("/api/profileGroup", profileGroupRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
