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
        { text: "Profile", link: "/profile" },
    ];

    return (
        <div className="px-5 md:px-15 w-full bg-[#121212] text-white flex flex-col md:flex-row justify-center items-center gap-6 py-8 md:py-0 md:h-[120px]">
            <div className="flex md:w-1/4 flex-col items-center md:items-start gap-2 text-center md:text-left">
                <img src={logo} alt="Logo IMG" className="h-5 md:h-4 lg:h-5" />
                <p className="text-sm max-w-[35ch]">
                    Smart Movie recommendations for you and your friends!
                </p>
            </div>

            <div className="flex flex-col items-center gap-2 md:w-1/4 border-t md:border-t-0 md:border-l md:border-l-white pt-4 md:pt-0 md:pl-6">
                <span className="font-semibold">Our Socials</span>
                <div className="flex flex-row gap-5">
                    {socials.map((social, index) => (
                        <a
                            key={index}
                            href={social.link}
                            aria-label={social.alt}
                        >
                            <img
                                src={social.icon}
                                className="h-7 hover:opacity-80 hover:scale-125 transition"
                            />
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center md:w-1/4 border-t md:border-t-0 md:border-l md:border-l-white pt-4 md:pt-0 md:pl-6">
                {footLinks.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.link}
                        className={({ isActive }) =>
                            isActive
                                ? "text-yellow-400"
                                : "hover:text-gray-500 hover:scale-110 transition text-sm hover:opacity-95"
                        }
                    >
                        {item.text}
                    </NavLink>
                ))}
            </div>

            <div className="flex flex-col items-center md:flex-row gap-2 md:w-1/4 border-t md:border-t-0 md:border-l md:border-l-white pt-4 md:pt-0 md:pl-6 text-center md:text-left">
                <span className="text-3xl">&copy;</span>
                <p className="text-sm">
                    Copyright 2025 - GURUFILM
                    <br />
                    All Rights Reserved
                </p>
            </div>
        </div>
    );
}

export default Footer;
