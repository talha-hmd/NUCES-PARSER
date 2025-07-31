import React from 'react'
import { useState } from 'react'
import HowItWorks from './HowItWorks'
import StatsPanel from './StatsPanel'
import TimetablePanel from './TimetablePanel'

export default function MainPanel() {
    const [parsedData, setParsedData] = useState([])

    return (
        <section className="w-full px-4 md:px-12 py-16 flex flex-col md:flex-row gap-8">
            {/* Left Side */}
            <div className="flex flex-col gap-6 md:w-[30%] w-full">
                <HowItWorks onParsedData={setParsedData} />
                <StatsPanel data={parsedData} />
            </div>

            {/* Right Side */}
            <div className="md:w-[70%] w-full">
                <TimetablePanel data={parsedData} />
            </div>
        </section>
    )
}
