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
const yourGroupRoutes = require("./routes/yourgroups");
const searchMembersGroup = require("./routes/searchMembersGroup");
const addMembersGroup = require("./routes/addMembersGroup");
const removeMembersGroup = require("./routes/removeMembersGroup");
const joinGroup = require("./routes/joinGroup");
const leaveGroup = require("./routes/leaveGroup");
const editGroup = require("./routes/editgroup");
const favoritesRoutes = require("./routes/favorites");
const historyRoutes = require("./routes/history");
const chatGroup = require("./routes/chatgroup");

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
app.use("/api/yourgroups", yourGroupRoutes);
app.use("/api/searchmembersgroup", searchMembersGroup);
app.use("/api/addmembersgroup", addMembersGroup);
app.use("/api/removemembersgroup", removeMembersGroup);
app.use("/api/joingroup", joinGroup);
app.use("/api/leavegroup", leaveGroup);
app.use("/api/editgroup", editGroup);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/chatgroup", chatGroup);

app.listen(PORT, () => {
    console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
