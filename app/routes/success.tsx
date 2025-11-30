import { Link, useLoaderData, redirect, useRevalidator } from "react-router";
import { createClient } from "redis";
import { SINT, PIET } from "./constants";
import type { Route } from "./+types/success";
import { useEffect } from "react";

export async function loader({}: Route.LoaderArgs) {
  const redis = await createClient({ url: process.env.REDIS_URL }).connect();
  
  const sintFound = await redis.get(SINT);
  const pietFound = await redis.get(PIET);
  
  await redis.disconnect();

  if (!sintFound && !pietFound) {
    return redirect("/");
  }

  if (sintFound && pietFound) {
    return { status: "complete" as const };
  }

  return { status: "partial" as const };
}

export default function Success() {
  const { status } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator()

  useEffect(() => {
    if (revalidator.state === "idle" && status === "partial") {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 2000);
      return () => clearTimeout(timer);
    }
    
  }, [revalidator.state])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-gray-950 to-gray-950 pointer-events-none" />
      
      {/* Confetti/Festive Elements (CSS based for simplicity) */}
      {status === "complete" && (
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
      )}

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <div className="animate-pulse">
          <span className="text-6xl">{status === "complete" ? "🔓" : "⏳"}</span>
        </div>
        
        <h1 className={`text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${status === "complete" ? "from-green-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "from-yellow-400 to-orange-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"} tracking-tight`}>
          {status === "complete" ? "MISSION ACCOMPLISHED" : "HALFWAY THERE"}
        </h1>
        
        <div className={`bg-gray-900/50 backdrop-blur-md border ${status === "complete" ? "border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-yellow-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]"} rounded-2xl p-8`}>
          <p className={`text-xl md:text-2xl ${status === "complete" ? "text-green-100" : "text-yellow-100"} font-mono mb-6`}>
            {status === "complete" 
              ? "ACCESS GRANTED. WELCOME, AGENT." 
              : "ONE HALF OF THE PUZZLE IS SOLVED."}
          </p>
          <p className="text-gray-400 text-lg">
            {status === "complete"
              ? "Sinterklaas has successfully received your signal. The gifts are safe."
              : "We need the other agent to complete its duties before the festivities are saved."}
          </p>
        </div>

        <Link 
          to="/"
          className={`inline-block px-8 py-4 ${status === "complete" ? "bg-green-600 hover:bg-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.6)]" : "bg-yellow-600 hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(202,138,4,0.6)]"} text-white font-bold rounded-full transition-all duration-300 hover:scale-105`}
        >
          RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}
