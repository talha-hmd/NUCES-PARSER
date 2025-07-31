/* ---------------------------------------------------------------------
   TimetablePanel.jsx   –  shows two modes:
     1) “all”      : the flat table you already had
     2) “section”  : 8×6 grid (time‑slots × days) that fills when the user
                     searches a section (e.g. “BCS 1A”, “BDS‑2B” …)
--------------------------------------------------------------------- */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Searchbar from "./Searchbar";
import SlotCell from "./SlotCell";
import html2canvas from 'html2canvas-pro'


/* ───────────────────── constants ───────────────────── */
const TIME_SLOTS = [
    { start: "08:30", end: "09:40" },
    { start: "10:00", end: "11:40" },
    { start: "11:30", end: "12:40" },
    { start: "13:00", end: "14:10" },
    { start: "14:30", end: "15:40" },
    { start: "16:00", end: "17:10" },
    { start: "17:30", end: "18:40" },
    { start: "19:00", end: "20:10" },
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const normalize = (str = "") =>
    str
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "");           // drops spaces, dashes, brackets etc.

// helper to pull "(BSE 2A)" →  "bse2a"
const sectionFromCourse = (course = "") => {
    const m = course.match(/\((.*?)\)/);     // grab text inside (...)
    return m ? normalize(m[1]) : "";
};


/* helpers ------------------------------------------------------------ */
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
};

const isInTimeSlot = (courseTime, slotStart, slotEnd) => {
    const [start] = courseTime.split(" - "); // e.g. "08:40 AM"
    const [h, m] = start.split(/[:\s]/);     // ["08","40","AM"]
    let hour = parseInt(h, 10);
    let min = parseInt(m, 10);
    const isPM = start.toUpperCase().includes("PM");
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    const minutes = hour * 60 + min;
    return minutes >= toMinutes(slotStart) && minutes < toMinutes(slotEnd);
};

/* ------------------------------------------------------------------- */

export default function TimetablePanel({ data }) {
    const [category, setCategory] = useState("all"); // "all" | "section"
    const [query, setQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [exportState, setExportState] = useState("idle");

    /* --------------- Handling Export Button --------------------- */
    const handleExport = () => {
        if (!query || !sectionGrid.length) {
            setExportState("error");
            return resetExportState();        // reset after 3 s
        }

        const table = document.getElementById("section-timetable");
        if (!table) {
            setExportState("error");
            return resetExportState();
        }

        // —— Clone, capture, download ——
        const clone = table.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = "max-content";
        clone.style.overflow = "visible";
        clone.className = table.className;
        document.body.appendChild(clone);

        html2canvas(clone, { backgroundColor: "#000", scale: 2 })
            .then((canvas) => {
                const link = document.createElement("a");
                link.download = `${query}_timetable.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                setExportState("done");
                document.body.removeChild(clone);
                resetExportState();
            })
            .catch((err) => {
                console.error("Export failed:", err);
                setExportState("error");
                document.body.removeChild(clone);
                resetExportState();
            });
    };

    const resetExportState = () =>
        setTimeout(() => setExportState("idle"), 3000);



    /* -------------- All‑columns debounce search ----------------- */
    const applyFilter = useCallback((input, rows) => {
        const q = normalize(input);
        if (!q) return rows;

        return rows.filter((r) => {
            const course = normalize(r.Course);
            const room = normalize(r.Room);
            return course.includes(q) || room.includes(q);
        });
    }, []);


    useEffect(() => {
        if (category !== "all") return;
        const t = setTimeout(
            () => setFilteredData(applyFilter(query, data)),
            400
        );
        return () => clearTimeout(t);
    }, [query, data, category, applyFilter]);

    /* -------------- initial full data ---------------------------- */
    useEffect(() => {
        if (data?.length) setFilteredData(data);
    }, [data]);

    /* -------------- grid map for Section view -------------------- */
    const sectionGrid = useMemo(() => {
        if (category !== "section" || !query) return null;
        const want = normalize(query);
        const grid = Array.from({ length: TIME_SLOTS.length }, () =>
            Array(DAYS.length).fill(null)
        );

        data.forEach((row) => {
            const sec = normalize(sectionFromCourse(row.Course));
            if (sec !== want) return;
            const dIdx = DAYS.indexOf(row.Day);
            if (dIdx === -1) return;
            const slotIdx = TIME_SLOTS.findIndex((s) =>
                isInTimeSlot(row.Time, s.start, s.end)
            );
            if (slotIdx === -1) return;
            grid[slotIdx][dIdx] = row;
        });
        return grid;
    }, [category, query, data]);

    /* -------------- search handler from <Searchbar/> ------------- */
    const handleSearch = (val) => setQuery(val);

    /* -------------- render --------------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            {/* ── header / search box ─────────────────────────────────── */}
            <div className="border border-white rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h2 className="text-white text-xl font-semibold">Parsed Timetable</h2>
                        <p className="text-slate-300 text-sm">Your organized class schedule</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className={
                            `cursor-none px-14 py-2 rounded text-sm transition
                            ${exportState === "idle" ? "bg-transparent text-white hover:bg-white hover:text-black" : exportState === "error" ? "bg-red-600 text-white" : /* done */               "bg-green-600 text-white"}`
                        }
                    >
                        {exportState === "idle" && "⇩ Export"}
                        {exportState === "error" && "Export failed"}
                        {exportState === "done" && "Saved!"}
                    </button>
                </div>
                <div className="mt-4">
                    <Searchbar
                        category={category}
                        setCategory={setCategory}
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            {/* ──────────────────  ALL‑COLUMNS  ───────────────────────── */}
            {category === "all" && (
                <div className="border border-white rounded-lg p-4 overflow-x-auto max-h-[388px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white text-black">
                                <th className="py-2 px-3">Day</th>
                                <th className="py-2 px-3">Time</th>
                                <th className="py-2 px-3">Course</th>
                                <th className="py-2 px-3">Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length ? (
                                filteredData.map((r, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-white hover:bg-white/10 transition"
                                    >
                                        <td className="py-2 px-3">{r.Day}</td>
                                        <td className="py-2 px-3">{r.Time}</td>
                                        <td className="py-2 px-3">{r.Course}</td>
                                        <td className="py-2 px-3">{r.Room}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        No results found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ──────────────────  SECTION VIEW  ──────────────────────── */}
            {category === "section" && (
                <div id="section-timetable" className="border border-white rounded-lg overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-white text-black">
                            <tr>
                                <th className="sticky left-0 bg-white py-2 px-4">Time</th>
                                {DAYS.map((d) => (
                                    <th key={d} className="py-2 px-4">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((slot, r) => (
                                <tr key={r} className="border-t border-white/20">
                                    <td className="sticky left-0 bg-black/40 backdrop-blur py-2 px-4 font-mono">
                                        {slot.start} – {slot.end}
                                    </td>
                                    {DAYS.map((_, c) => (
                                        <td key={c} className="h-10 w-32 max-w-60 text-center px-1 py-1 hover:bg-white/10 transition duration-300">
                                            <SlotCell data={sectionGrid?.[r]?.[c]} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
