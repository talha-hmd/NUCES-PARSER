import React from 'react'

export const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-20 mt-10">

      {/* Live Badge */}
      <div className="flex items-center mb-4">
        <span className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-[ping_2.0s_ease-in-out_infinite] shadow-[0_0_10px_2px_rgba(34,197,94,0.7)]"></span>
        <span className="text-sm text-slate-300">Live Parser</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-6xl font-inter font-extrabold text-white mb-4">
        NUCES-PARSER
      </h1>

      {/* Subheading */}
      <p className="text-slate-300 text-base md:text-lg max-w-2xl mb-6 font-poppins">
        Transform chaotic timetable documents into organized, readable schedules. Built for FAST students, by FAST students.
      </p>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-4 text-gray-500 text-xs font-poppins">
        <div className="flex items-center gap-2">
          <i className="fa-regular fa-clock"></i>
          Instant parsing
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-people-group"></i>
          Student-built
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-book-open-reader"></i>
          Open source
        </div>
      </div>
    </section>
  )
}

export default Hero