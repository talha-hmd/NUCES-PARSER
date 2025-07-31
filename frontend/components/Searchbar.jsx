import React, { useState, useEffect } from "react";

export default function Searchbar({ category, setCategory, onSearch }) {
    const [input, setInput] = useState("");

    // Debounce effect (300ms delay)
    useEffect(() => {
        const delay = setTimeout(() => {
            onSearch(input.trim());
        }, 300);
        return () => clearTimeout(delay); // cleanup on new keystroke
    }, [input, onSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(input.trim());
    };

    return (
        <form
            className="w-full flex flex-wrap sm:flex-nowrap gap-2"
            onSubmit={handleSubmit}
        >
            <select
                className="w-full sm:w-auto px-3 py-2 bg-white text-black border rounded cursor-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="all">All Columns</option>
                <option value="section">Section View</option>
            </select>

            <input
                type="text"
                name="query"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(e);
                }}
                className="flex-grow min-w-0 px-3 py-2 bg-transparent text-white border border-white rounded cursor-none"
                placeholder={
                    category === "section"
                        ? "Search by section (e.g. BCS 1A)"
                        : "Search courses or rooms..."
                }
            />

            <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-transparent text-white rounded hover:bg-white hover:text-black text-sm transition duration-300 cursor-none"
            >
                Search
            </button>
        </form>

    );
}
