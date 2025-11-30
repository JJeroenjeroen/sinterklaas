import { Form, useActionData, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/question";
import { createClient } from 'redis';
import { getSession } from "../clients/sessions.server";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Question ${params.questionId}` },
    { name: "description", content: "Answer the secret question." },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const questionId = parseInt(params.questionId);
  if (isNaN(questionId) || questionId < 1 || questionId > 4) {
    throw new Response("Not Found", { status: 404 });
  }
  
  const session = await getSession(request.headers.get("Cookie"));
  const name = session.get("name") || "Agent";

  return { questionId, name };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const answer = formData.get("answer");
  const questionId = params.questionId;

  if (typeof answer !== "string" || !answer.trim()) {
    return { error: true, message: "INPUT REQUIRED" };
  }

  // Here you could store the answer in Redis if needed
  // const redis = await createClient({ url: process.env.REDIS_URL }).connect();
  // await redis.set(`answer:${questionId}`, answer);
  
  // For now, just redirect back to home with a success indicator? 
  // Or maybe stay on page and show success?
  // Let's redirect to home for now as per "submit the answer" usually implies completion.
  // But maybe the user wants to see it was submitted.
  
  return redirect("/");
}

export default function Question() {
  const { questionId, name } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-gray-900 border-2 border-gray-700 shadow-2xl rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-100 tracking-widest uppercase mb-2">
              {`DATA STREAM 0${questionId}`}
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              AUTHORIZATION: {name}
            </p>
          </div>

          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="answer" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                INPUT DATA
              </label>
              <input
                type="text"
                name="answer"
                id="answer"
                autoComplete="off"
                className="w-full bg-gray-950 border-2 border-gray-700 text-yellow-500 focus:border-yellow-500 rounded-lg p-4 text-lg font-mono focus:outline-none transition-colors placeholder-gray-800"
                placeholder="TYPE HERE..."
              />
            </div>

            {actionData?.error && (
               <p className="text-red-500 text-xs font-bold tracking-widest text-center">
                 ⚠️ {actionData.message}
               </p>
            )}

            <button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg transition-all duration-200 uppercase tracking-widest shadow-lg"
            >
              TRANSMIT
            </button>
          </Form>
          
          <div className="mt-6 text-center">
             <a href="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors uppercase tracking-widest">
               &lt; ABORT TRANSMISSION
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
