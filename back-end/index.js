require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moviesRoute = require("./routes/movies");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use("/api/movies", moviesRoute);

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
