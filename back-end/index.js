require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moviesRoute = require("./routes/movies");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); 

app.use("/api/movies", moviesRoute);
app.use("/api/auth", authRoutes); 
app.use("/api/contact", contactRoutes); 

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
