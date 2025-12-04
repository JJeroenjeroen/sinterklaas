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
        <>
          {/* Reduced Emojis */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce text-4xl opacity-60 drop-shadow-lg"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                {["🎁", "✨", "�"][Math.floor(Math.random() * 3)]}
              </div>
            ))}
          </div>

          {/* Fireworks and Confetti Animations */}
          <style>{`
            @keyframes shootUp {
              0% { 
                transform: translateY(0) scale(1);
                opacity: 1;
              }
              85% {
                opacity: 1;
              }
              100% { 
                transform: translateY(var(--target-y)) scale(0.3);
                opacity: 0;
              }
            }
            
            @keyframes explode {
              0% { 
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% { 
                transform: translate(var(--x), var(--y)) scale(0);
                opacity: 0;
              }
            }
            
            @keyframes fireworkCycle {
              0%, 100% {
                opacity: 1;
              }
            }
            
            @keyframes confettiFall {
              0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0.3;
              }
            }
          `}</style>
          
          {/* Falling Confetti */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            {[...Array(200)].map((_, i) => {
              const colors = ['#ff0000', '#ffd700', '#00ff00', '#0080ff', '#ff00ff', '#ff6b00', '#ffffff'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const left = Math.random() * 100;
              const delay = Math.random() * 5;
              const duration = 3 + Math.random() * 4;
              
              return (
                <div
                  key={`confetti-${i}`}
                  className="absolute w-2 h-3 rounded-sm"
                  style={{
                    backgroundColor: color,
                    left: `${left}%`,
                    top: '-10px',
                    animation: `confettiFall ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Shooting Fireworks */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            {[...Array(80)].map((_, i) => {
              const colors = ['#ff0000', '#ffd700', '#00ff00', '#0080ff', '#ff00ff', '#ff6b00', '#ff1493', '#00ffff'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const startX = 10 + Math.random() * 80;
              const explosionY = 15 + Math.random() * 45; // Where it explodes (15-60% from top)
              const totalDuration = 8; // Total animation cycle
              const shootDelay = Math.random() * 12; // Random delay between 0-5 seconds
              const shootDuration = 0.8 + Math.random() * 0.4;
              const explodeDuration = 1.2;
              
              return (
                <div
                  key={`firework-${i}`}
                  className="absolute"
                  style={{
                    left: `${startX}%`,
                    bottom: 0,
                    animation: `fireworkCycle ${totalDuration}s linear ${shootDelay}s infinite`,
                  }}
                >
                  {/* Shooting rocket trail */}
                  <div
                    className="absolute w-1 h-16 rounded-full origin-bottom"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
                      animation: `shootUp ${shootDuration}s ease-out forwards`,
                      '--target-y': `-${100 - explosionY}vh`,
                    } as React.CSSProperties}
                  />
                  
                  {/* Explosion container - positioned at explosion point */}
                  <div
                    className="absolute"
                    style={{
                      bottom: `${100 - explosionY}vh`,
                      left: 0,
                    }}
                  >
                    {[...Array(20)].map((_, j) => {
                      const angle = (j / 20) * Math.PI * 2;
                      const distance = 40 + Math.random() * 100;
                      const xOffset = Math.cos(angle) * distance;
                      const yOffset = Math.sin(angle) * distance;
                      
                      return (
                        <div
                          key={`particle-${j}`}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
                            opacity: 0,
                            animation: `explode ${explodeDuration}s ease-out ${shootDuration}s forwards`,
                            '--x': `${xOffset}px`,
                            '--y': `${yOffset}px`,
                          } as React.CSSProperties}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
              ? <>Gefeliciteerd, het feest is gered!<br/>Door jullie is alles rechtgezet.</>
              : "Nog even geduld..."}
          </p>
          <p className="text-gray-300 text-xl md:text-2xl font-medium">
            {status === "complete"
              ? <>Kijk in de werkkamer, daar staat wat klaar.<br/>Een cadeautje van de Sint, echt waar!</>
              : "We wachten op de bevestiging van de andere agent. Blijf stand-by!"}
          </p>
        </div>


      </div>
    </div>
  );
}
