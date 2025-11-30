import { Form, useActionData, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/question";
import { getSession } from "../clients/sessions.server";
import { LOCATION_LIST, ANSWERS } from "./constants";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Question ${params.questionId}` },
    { name: "description", content: "Answer the secret question." },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const questionId = parseInt(params.questionId);
  if (isNaN(questionId) || questionId < 0 || questionId > 3) {
    throw new Response("Not Found", { status: 404 });
  }
  
  const session = await getSession(request.headers.get("Cookie"));
  const name = session.get("name") || "Agent";

  return { questionId, name };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const answer = formData.get("answer");
  const questionId = parseInt(params.questionId);
  const session = await getSession(request.headers.get("Cookie"));
  let name = session.get("name");
  if (name.toUpperCase() !== "MARLIES" && name.toUpperCase() !== "ROAN") {
    name = `ROAN`
    // TODO: SHOW ERROR MESSAGE
    // return { error: true, message: "ACCESS DENIED" };
  }
  const answers = ANSWERS[name.toUpperCase()];
  const correctAnswer = answers[LOCATION_LIST[questionId]];

  if (answer != correctAnswer) {
    return { correct: false, message: "WRONG ANSWER" };
  }
  else {
    return { correct: true, message: "CORRECT ANSWER" };
  }
}

export default function Question() {
  const { questionId, name } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = LOCATION_LIST[questionId];

  // Show celebration if correct
  if (actionData?.correct) {
    return (
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-gray-900 border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)] rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-2xl font-bold text-green-400 tracking-widest uppercase mb-2">
              CORRECT!
            </h1>
            <p className="text-gray-400 text-sm">
              {actionData.message}
            </p>
          </div>

          <a
            href="/"
            className="block w-full bg-green-600 hover:bg-green-500 text-gray-900 font-bold py-4 px-6 rounded-lg transition-all duration-200 uppercase tracking-widest shadow-lg text-center"
          >
            RETURN TO BASE
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-md w-full">
      <div className={`bg-gray-900 border-2 ${actionData?.correct === false ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'border-gray-700 shadow-2xl'} rounded-xl p-8 transition-all duration-300`}>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-100 tracking-widest uppercase mb-2">
            {`${LOCATION_LIST[questionId]}`}
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
              className={`w-full bg-gray-950 border-2 ${actionData?.correct === false ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-gray-700 text-yellow-500 focus:border-yellow-500'} rounded-lg p-4 text-lg font-mono focus:outline-none transition-colors placeholder-gray-800`}
              placeholder="TYPE HERE..."
            />
          </div>

          {actionData?.error && (
             <p className="text-red-500 text-xs font-bold tracking-widest text-center">
               ⚠️ {actionData.message}
             </p>
          )}

          {actionData?.correct === false && (
             <p className="text-red-500 text-xs font-bold tracking-widest text-center animate-pulse">
               ⚠️ {actionData.message} ⚠️
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
  );
}
