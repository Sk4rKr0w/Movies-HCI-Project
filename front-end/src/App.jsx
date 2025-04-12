import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import GroupWatch from "./pages/GroupWatch";
import GroupProfile from "./pages/GroupProfile";
import Sidebar from "./components/Sidebar";
import MoviePage from "./pages/MoviePage";
import GroupCreation from "./pages/GroupCreation";

function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/groupwatch" element={<GroupWatch />} />
                <Route path="/movie/:id" element={<MoviePage />} />{" "}
                <Route path="/movie/:id" element={<MoviePage />} />{" "}
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
