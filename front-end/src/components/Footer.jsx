import logo from "../assets/images/logo.svg";
import instagram from "../assets/images/instagram.svg";
import twitter from "../assets/images/twitter.svg";
import facebook from "../assets/images/facebook.svg";
import tiktok from "../assets/images/tiktok.svg";
import { NavLink } from "react-router-dom";

function Footer() {
    const socials = [
        { icon: instagram, alt: "Instagram", link: "https://instagram.com" },
        { icon: twitter, alt: "Twitter", link: "https://twitter.com" },
        { icon: facebook, alt: "Facebook", link: "https://facebook.com" },
        { icon: tiktok, alt: "TikTok", link: "https://tiktok.com" },
    ];

    const footLinks = [
        { text: "About", link: "/about" },
        { text: "Contact", link: "/contact" },
        { text: "Group Watch", link: "/groupwatch" },
        { text: "News", link: "/news" },
        { text: "Pricing", link: "/pricing" },
    ];

    return (
        <div className="px-5 md:px-15 w-full md:h-[120px] bg-[#121212] text-white flex flex-col md:flex-row justify-center items-center">
            <div className="hidden md:flex md:w-1/4 flex-col items-start gap-2">
                <img src={logo} alt="Logo IMG" className="h-6" />
                <p className="text-sm max-w-[35ch]">
                    Smart Movie recommendations for you and your friends!
                </p>
            </div>
            <div className="hidden md:border-l-2 md:border-l-white h-[80%] md:flex md:w-1/4 flex-col justify-center items-center gap-y-2">
                <span>Our Socials</span>
                <div className="flex flex-row gap-5">
                    {socials.map((social, index) => (
                        <a key={index} href={social.link} alt={social.alt}>
                            <img
                                src={social.icon}
                                className="h-7 hover:opacity-80 hover:scale-125 transition"
                            ></img>
                        </a>
                    ))}
                </div>
            </div>
            <div className="p-5 md:border-l-2 md:p-0 text-center md:border-l-white h-[80%] grid md:w-1/4 w-full grid-cols-3 gap-2 justify-center items-center">
                {footLinks.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.link}
                        className={({ isActive }) =>
                            isActive
                                ? "text-yellow-400"
                                : "hover:text-gray-500 transition text-sm hover:opacity-50"
                        }
                    >
                        {item.text}
                    </NavLink>
                ))}
            </div>
            <div className="p-5 md:p-0 md:border-l-2 md:border-l-white h-[80%] flex w-full md:w-1/4 flex-row justify-center items-center gap-x-2">
                <span className="text-3xl">&copy;</span>
                <div>
                    <p>
                        Copyright 2025 - GURUFILM
                        <br />
                        All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Footer;
