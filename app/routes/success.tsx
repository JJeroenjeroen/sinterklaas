import { Link } from "react-router";

export default function Success() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-gray-950 to-gray-950 pointer-events-none" />
      
      {/* Confetti/Festive Elements (CSS based for simplicity) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce text-4xl opacity-50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {["🎁", "🍬", "🥕", "✨"][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <div className="animate-pulse">
          <span className="text-6xl">🔓</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
          MISSION ACCOMPLISHED
        </h1>
        
        <div className="bg-gray-900/50 backdrop-blur-md border border-green-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <p className="text-xl md:text-2xl text-green-100 font-mono mb-6">
            ACCESS GRANTED. WELCOME, AGENT.
          </p>
          <p className="text-gray-400 text-lg">
            Sinterklaas has successfully received your signal. The gifts are safe.
          </p>
        </div>

        <Link 
          to="/"
          className="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(22,163,74,0.6)]"
        >
          RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}
