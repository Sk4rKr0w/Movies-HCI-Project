import { NavLink } from "react-router-dom"; // Cambia Link con NavLink
import SearchBar from "./SearchBar";
import HamburgerIcon from "./HamburgerIcon";
import logo from "../assets/images/logo.svg";
import HelloUser from "./HelloUser";

function NavBar() {
    return (
        <nav className="h-[92px] w-full bg-[#121212] text-white flex items-center justify-between px-6">
            <NavLink to="/">
                <img
                    src={logo}
                    alt="Logo dell'applicazione"
                    className="h-5 md:ml-10 lg:ml-25"
                />
            </NavLink>
            <div className="hidden md:flex md:gap-5 md:text-center md:flex-row md:space-x-2 lg:space-x-5">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive
                            ? "text-yellow-400"
                            : "hover:text-gray-500 transition"
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        isActive
                            ? "text-yellow-400"
                            : "hover:text-gray-500 transition"
                    }
                >
                    About
                </NavLink>
                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        isActive
                            ? "text-yellow-400"
                            : "hover:text-gray-500 transition"
                    }
                >
                    Contact
                </NavLink>
            </div>
                    
            <div className="flex items-center gap-10">
                <HelloUser />
                <SearchBar />
                <HamburgerIcon className="md:hidden" />
            </div>
        </nav>
    );
}

export default NavBar;
