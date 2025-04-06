import { useState } from "react";
import search from "../assets/images/search.svg";

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="hidden md:flex md:flex-row bg-white h-full p-0.5 rounded-3xl gap-1">
            <button className="m-1 cursor-pointer">
                <img src={search} alt="Search" className="w-6 h-6" />
            </button>
            <input
                className="text-black outline-0 text-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleChange}
            />
        </div>
    );
}

export default SearchBar;
