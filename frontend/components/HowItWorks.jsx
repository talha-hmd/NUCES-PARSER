import React, { useState, useRef, useEffect } from "react";
import Loader from "./Loader";
import { parseTimetable } from "../api/uploadTimetable";

export default function HowItWorks({ onParsedData }) {
    const [status, setStatus] = useState("idle");     // idle | success | error
    const [message, setMessage] = useState("");
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // quick validation
        const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
        const isWithinSize = file.size <= 200 * 1024 * 1024;

        if (!isXlsx) {
            setStatus("error");
            setMessage("xlsx files only");
            return;
        }
        if (!isWithinSize) {
            setStatus("error");
            setMessage("File exceeds 200 MB");
            return;
        }

        // reset UI + start loading
        setFileName(file.name);
        setLoading(true);
        setStatus("idle");
        try {
            const parsed = await parseTimetable(file);     // ⬅️ calls JS parser
            onParsedData(parsed);                          // send up to MainPanel
            setStatus("success");
            setMessage("Uploaded Successfully");
        } catch (err) {
            console.error(err);
            setStatus("error");
            setMessage("Parsing failed");
        } finally {
            setLoading(false);
            // clear <input/> value so user can re‑upload same file if needed
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    /* auto‑reset status text after 3 s (unchanged) */
    useEffect(() => {
        if ((status === "success" || status === "error") && !loading) {
            const t = setTimeout(() => {
                setStatus("idle");
                setMessage("");
                setFileName("");
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [status, loading]);

    const getIcon = () => {
        if (status === "success") return <i className="fa-solid fa-check text-white" />;
        if (status === "error") return <i className="fa-solid fa-triangle-exclamation text-white" />;
        return <i className="fa-solid fa-upload text-white group-hover:text-black transition" />;
    };

    return (
        <div className="section-box space-y-4">
            <h2 className="white-heading text-lg flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-white text-base"></i>
                How it works
            </h2>

            <p className="description-text text-sm">
                Upload your FAST timetable document and our parser will automatically
                extract course codes, time slots, room assignments, and instructor
                information – no server needed!
            </p>

            {loading ? (
                <div className="flex justify-center items-center h-10">
                    <Loader />
                </div>
            ) : (
                <label
                    className={`group inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-white cursor-none font-semibold transition
                        ${status === "success"
                            ? "bg-green-600 text-white"
                            : status === "error"
                                ? "bg-red-600 text-white"
                                : "text-white hover:bg-white hover:text-black"
                        }`}
                >
                    {getIcon()}
                    {status === "success"
                        ? `Uploaded`
                        : status === "error"
                            ? `Error: ${message}`
                            : "Upload Document"}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            )}

            <p className="text-xs text-gray-500">(.xlsx only, max size: 200MB)</p>
        </div>
    );
}
