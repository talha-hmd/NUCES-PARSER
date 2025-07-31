import { Link } from 'react-router-dom';
import React from 'react'

const Header = () => {
    return (
        <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-white shadow-md transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Left: Logo and Title */}
                <div className="flex items-center space-x-4">
                    <div className="w-7 h-7 bg-white rounded-sm" />
                    <span className="text-white font-bold text-xl font-display">NUCES-PARSER</span>
                    <span className="bg-slate-800 text-slate-300 text-sm px-3 py-0.5 rounded-full hover:bg-slate-700 cursor-default transition duration-300">Beta</span>
                </div>

                {/* Right: Contact */}
                <Link
                    to="/contact"
                    className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-500/20 transition duration-300"
                >
                    <i className="fas fa-envelope text-white text-base"></i>
                    <span className="text-white text-base font-body">Contact</span>
                </Link>

            </div>
        </header>
    )
}

export default Header