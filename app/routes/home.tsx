import { Form, useActionData, redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { createClient } from 'redis';
import { SINT, PIET } from "./constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sinterklaas Secrets" },
    { name: "description", content: "Enter the secret code to proceed." },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const redis = await createClient({ url: process.env.REDIS_URL }).connect();

  const formData = await request.formData();
  const code = formData.get("code");

  if (typeof code !== "string") {
    return { error: true, message: "INVALID INPUT" };
  }

  const normalizedCode = code.trim().toUpperCase();
  if (normalizedCode === SINT || normalizedCode === PIET) {
    await redis.set(normalizedCode, "true", { EX: 60 * 5 }); // Set key with a 5-minute TTL
    return redirect("/success");
  }

  return { error: true, message: "ACCESS DENIED" };
}

export default function Home() {
  const actionData = useActionData<typeof action>();
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [searchParams, _] = useSearchParams()

  const name = searchParams.get("name") || "Agent Piet"

  useEffect(() => {
    if (actionData?.error) {
      setIsBuzzing(true);
      const timer = setTimeout(() => setIsBuzzing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

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

          {/* Form */}
          <Form method="post" className="space-y-6">
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
