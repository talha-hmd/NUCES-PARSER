import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';

const StatsPanel = ({ data }) => {
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalSections, setTotalSections] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [readyToShow, setReadyToShow] = useState(false);

    useEffect(() => {
        if (!Array.isArray(data) || data.length === 0) {
            setReadyToShow(false); // Reset flag
            return;
        }

        try {
            const courseNames = data.map(row =>
                row.Course?.split('(')[0].trim()
            );
            const sectionNames = data.map(row => {
                const match = row.Course?.match(/\((.*?)\)/);
                return match ? match[1].trim() : null;
            }).filter(Boolean);

            setTotalEntries(data.length);
            setTotalCourses(new Set(courseNames).size);
            setTotalSections(new Set(sectionNames).size);

            setShowSuccess(false);
            setReadyToShow(true); // Allow rendering CountUp only now
        } catch (err) {
            console.error("Error computing stats:", err);
        }
    }, [data]);

    return (
        <div className="section-box">
            <h2 className="text-white font-inter text-lg font-semibold mb-4">
                Statistics
            </h2>

            <div className="flex justify-between text-sm mb-2">
                <span>Total Entries</span>
                <span className="font-medium font-mono">
                    {readyToShow && <CountUp end={totalEntries} duration={2} />}
                </span>
            </div>

            <div className="flex justify-between text-sm mb-2">
                <span>Total Courses</span>
                <span className="font-medium font-mono">
                    {readyToShow && <CountUp end={totalCourses} duration={2} />}
                </span>
            </div>

            <div className="flex justify-between text-sm mb-4 pb-4 border-b border-white">
                <span>Total Sections</span>
                <span className="font-medium font-mono">
                    {readyToShow && (
                        <CountUp
                            end={totalSections}
                            duration={2}
                            onEnd={() => setShowSuccess(true)}
                        />
                    )}
                </span>
            </div>

            <div className="flex justify-between text-sm text-green-500 font-medium">
                <span>Success</span>
                <span className="font-mono">
                    {showSuccess ? <span><CountUp end={100} duration={3} />%</span> : "—"}
                </span>
            </div>
        </div>
    );
};

export default StatsPanel;