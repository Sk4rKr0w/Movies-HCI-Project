function HamburgerIcon({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer flex flex-col justify-between items-center w-10 h-10 gap-1 p-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-300"
            aria-label="Menu"
        >
            <span className="block w-7 h-0.75 bg-gray-100 rounded-md transition duration-200 ease-in-out"></span>
            <span className="block w-7 h-0.75 bg-gray-100 rounded-md transition duration-200 ease-in-out"></span>
            <span className="block w-7 h-0.75 bg-gray-100 rounded-md transition duration-200 ease-in-out"></span>
        </button>
    );
}

export default HamburgerIcon;
