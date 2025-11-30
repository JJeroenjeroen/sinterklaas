import { Link, useLoaderData, redirect, useRevalidator } from "react-router";
import { createClient } from "redis";
import { SINT, PIET } from "./constants";
import type { Route } from "./+types/success";
import { useEffect } from "react";
import { getSession } from "../clients/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  const redis = await createClient({ url: process.env.REDIS_URL }).connect();
  
  const sintFound = await redis.get(SINT);
  const pietFound = await redis.get(PIET);
  
  await redis.disconnect();

  const session = await getSession(request.headers.get("Cookie"));
  const name = session.get("name") || "Agent";

  if (!sintFound && !pietFound) {
    return redirect("/");
  }

  if (sintFound && pietFound) {
    return { status: "complete" as const, name };
  }

  return { status: "partial" as const, name };
}

export default function Success() {
  const { status, name } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (revalidator.state === "idle" && status === "partial") {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [revalidator.state, status]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${status === "complete" ? "from-red-900/40 via-gray-950 to-gray-950" : "from-yellow-900/20 via-gray-950 to-gray-950"} pointer-events-none transition-colors duration-1000`} />
      
      {/* Enhanced Confetti/Festive Elements */}
      {status === "complete" && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-5xl opacity-80 drop-shadow-lg"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🎁", "🍬", "🥕", "✨", "🍫", "🍊", "📜"][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl w-full text-center space-y-10">
        {/* Animated Icon */}
        <div className="animate-pulse mb-8">
          <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
            {status === "complete" ? "🔓" : "⏳"}
          </span>
        </div>
        
        {/* Main Title */}
        <h1 className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${status === "complete" ? "from-red-500 via-yellow-400 to-red-500 animate-text" : "from-yellow-400 to-orange-600"} tracking-tight drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]`}>
          {status === "complete" ? "MISSIE GESLAAGD" : "WE ZIJN ER BIJNA!"}
        </h1>
        
        {/* Message Box */}
        <div className={`bg-gray-900/80 backdrop-blur-xl border-2 ${status === "complete" ? "border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]" : "border-yellow-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]"} rounded-3xl p-10 transform transition-all hover:scale-105 duration-500`}>
          <p className={`text-2xl md:text-4xl ${status === "complete" ? "text-yellow-100" : "text-yellow-100"} font-bold mb-6 leading-relaxed`}>
            {status === "complete" 
              ? `Sinterklaas heeft al zijn cadeau's kunnen bezorgen!` 
              : "Nog even geduld..."}
          </p>
          <p className="text-gray-300 text-xl md:text-2xl font-medium">
            {status === "complete"
              ? <span>Bedankt agent <span className="text-yellow-400 font-bold underline decoration-wavy decoration-red-500">{name}</span>. Jullie hebben het feest gered!</span>
              : "We wachten op de bevestiging van de andere agent. Blijf stand-by!"}
          </p>
        </div>


      </div>
    </div>
  );
}
