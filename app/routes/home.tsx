import { Form, useActionData, redirect, useSearchParams, useLoaderData, data } from "react-router";
import type { Route } from "./+types/home";
import { useEffect, useState, useRef } from "react";
import { createClient } from 'redis';
import { SINT, PIET } from "./constants";
import { getSession, commitSession } from "../clients/sessions.server";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sinterklaas Secrets" },
    { name: "description", content: "Enter the secret code to proceed." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const nameParam = url.searchParams.get("name");
  let name = session.get("name");

  if (!name && nameParam) {
    session.set("name", nameParam);
    name = nameParam;
    return data(
      { name },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return { name };
}

export async function action({ request }: Route.ActionArgs) {
  const redis = await createClient({ url: process.env.REDIS_URL }).connect();

  const formData = await request.formData();
  const code = formData.get("code");

  if (typeof code !== "string") {
    return { error: true, message: "INVALID INPUT" };
  }

  const normalizedCode = code.trim().toUpperCase();
  const name = formData.get("name");
  
  if (normalizedCode === SINT || normalizedCode === PIET) {
    await redis.set(normalizedCode, "true", { EX: 60 * 5 }); // Set key with a 5-minute TTL
    const params = new URLSearchParams();
    if (typeof name === "string") params.set("name", name);
    return redirect(`/success?${params.toString()}`);
  }

  return { error: true, message: "ACCESS DENIED" };
}

export default function Home() {
  const actionData = useActionData<typeof action>();
  const [isBuzzing, setIsBuzzing] = useState(false);
  const { name } = useLoaderData<typeof loader>();
  // Prioritize name from loader (session), then search params, then default


  useEffect(() => {
    if (actionData?.error) {
      setIsBuzzing(true);
      const timer = setTimeout(() => setIsBuzzing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

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

      <div className={`relative z-10 max-w-md w-full transition-transform duration-100 ${isBuzzing ? 'translate-x-[-10px] md:translate-x-[-20px]' : ''}`}>
        {/* Main Card */}
        <div className={`bg-gray-900 border-2 ${actionData?.error ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'border-gray-700 shadow-2xl'} rounded-xl p-8 overflow-hidden relative transition-all duration-300`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-gray-800 mb-4 border border-gray-700">
              <span className="text-4xl">🕵️‍♂️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-widest uppercase mb-2">
              {`TOP GEHEIM: ALLEEN VOOR ${name.toUpperCase()}`}
            </h1>
            <p className="text-gray-500 text-sm">
              MISSIE: <span className="text-yellow-500 font-bold">DECEMBER 5</span>
            </p>
          </div>

          {/* Mysterious Buttons */}
          <div className="flex flex-col space-y-3 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <a 
                key={num}
                href={`/${num}`}
                className="group relative overflow-hidden bg-gray-950 border border-gray-800 hover:border-yellow-500/50 p-3 rounded-lg text-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="text-gray-500 group-hover:text-yellow-400 font-mono text-sm tracking-[0.2em] transition-colors">
                  {`// DATA_STREAM_0${num}`}
                </span>
              </a>
            ))}
          </div>

          {/* Form */}
          <Form method="post" className="space-y-6">
            <input type="hidden" name="name" value={name} />
            <div className="space-y-2">
              <label htmlFor="code" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Vul Toegangscode In
              </label>
              <input
                type="text"
                name="code"
                id="code"
                autoComplete="off"
                placeholder="____"
                className={`w-full bg-gray-950 border-2 ${actionData?.error ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-gray-700 text-green-400 focus:border-green-500'} rounded-lg p-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-0 transition-colors uppercase placeholder-gray-800`}
              />
            </div>

            {/* Error Message */}
            {actionData?.error && (
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-center animate-pulse">
                <p className="text-red-500 font-bold tracking-widest">
                  ⚠️ {actionData.message} ⚠️
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-4 px-6 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-95"
            >
              Authenticate
            </button>
          </Form>

          {/* Footer Decor */}
          <div className="mt-8 flex justify-between items-center text-[10px] text-gray-600 uppercase">
            <span>System: SECURE</span>
            <span>v5.12.24</span>
          </div>
        </div>
      </div>
    </div>
  );
}
