import { Outlet } from "react-router";
import { useEffect, useRef } from "react";

export default function HomeLayout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const fontSize = 40;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -20));
    
    const cyrillic = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ1234567890";
    const hiddenWords = ["СИНТЕРКЛААС", "ПИЕТ", "СЕКРЕТ", "ПОДАРОК", "ДЕКАБРЬ", "МИССИЯ"];
    
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const isWord = Math.random() > 0.98; // 2% chance for a word
        let text = cyrillic.charAt(Math.floor(Math.random() * cyrillic.length));
        
        if (isWord) {
           text = hiddenWords[Math.floor(Math.random() * hiddenWords.length)];
           ctx.fillStyle = "#FF0000"; // Super Red
           ctx.shadowColor = "#FF0000";
           ctx.shadowBlur = 10;
        } else {
           ctx.fillStyle = "#FFFFFF"; // Pure White
           ctx.shadowColor = "#FFFFFF";
           ctx.shadowBlur = 5;
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset shadow for next iteration (though we set it every time now)
        ctx.shadowBlur = 0;

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 75);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Matrix Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      />

      {/* Sinterklaas Elements */}
      <div className="absolute top-10 right-10 text-6xl opacity-20 rotate-12 pointer-events-none">
        🎁
      </div>
      <div className="absolute bottom-10 left-10 text-6xl opacity-20 -rotate-12 pointer-events-none">
        🥕
      </div>

      <Outlet />
    </div>
  );
}
