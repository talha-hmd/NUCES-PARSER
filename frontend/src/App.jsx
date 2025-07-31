import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import MainPanel from '../components/MainPanel'
import LoadingScreen from '../components/LoadingScreen'
import Cursor from "../components/Cursor";
import AnimatingBall from "../components/AnimatingBall";

function App() {
  const [loading, setLoading] = useState(true)
  const [animateIn, setAnimateIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setAnimateIn(true), 50); // slight delay to trigger animation
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className={`${!isMobile ? "cursor-none" : ""} relative overflow-hidden`}>
        {!isMobile && < Cursor />}

        <AnimatingBall />

        {loading ? (
          <LoadingScreen />
        ) : (
          <div
            className={`z-10min-h-screen bg-black text-slate-300 font-body transition-all duration-5000 ease-out ${animateIn ? "blur-none opacity-100" : "blur-md opacity-0"
              }`}
          >
            <Header />
            <main className="max-w-6xl mx-auto px-4 relative">
              <Hero />
              <MainPanel />
            </main>
          </div>
        )}
      </div>
    </>
  )
}

export default App
