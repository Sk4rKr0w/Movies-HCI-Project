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
import GroupCreation from "./pages/GroupCreation";
import Sidebar from "./components/Sidebar";
import MoviePage from "./pages/MoviePage";
import EditPage from "./pages/GroupEdit";
import SlotMachine from "./pages/SlotMachine";
import GroupRoulette from "./pages/GroupRoulette";


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
                <Route path="/groupprofile/:id" element={<GroupProfile />} />
                <Route path="/groupcreation" element={<GroupCreation />} />
                <Route path="/movie/:id" element={<MoviePage />} />{" "}
                <Route path="/groupedit/:id" element={<EditPage />} />
                <Route path="/slotmachine" element={<SlotMachine />} />
                <Route path="/group/:id/roulette" element={<GroupRoulette />} />

            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
