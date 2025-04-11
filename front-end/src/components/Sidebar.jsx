import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import Test from "../assets/images/close.svg";

function Sidebar({ isOpen, onClose }) {
    return (
        <div
            className={`fixed top-0 right-0 h-screen w-1/2 p-5 backdrop-blur-sm bg-black/50 z-50
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <button onClick={onClose} aria-label="Close Sidebar">
                <img src={Test} alt="Close Button" className="w-6 h-6" />
            </button>

            <ul className="flex flex-col items-center space-y-4 mt-8">
                <NavLink to="/about"><li>TOP FILMS</li></NavLink>
                <NavLink to="/"><li>MY GROUPS</li></NavLink>
                <NavLink to="/"><li>WATCHLIST</li></NavLink>
                <NavLink to="/"><li>SETTINGS</li></NavLink>
                <NavLink to="/"><li>BILLING</li></NavLink>
            </ul>
        </div>
    );
}

export default Sidebar;
