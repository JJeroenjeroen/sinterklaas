import { Form, useActionData, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/question";
import { commitSession, getSession } from "../clients/sessions.server";
import { LOCATION_LIST, ANSWERS, CORRECT_ANSWER_MESSAGES, CODEWORDS } from "./constants";

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
  let name = session.get("name") || "Agent";
  if (name.toUpperCase() !== "MARLIES" && name.toUpperCase() !== "ROAN") {
    name = "ROAN";
  }
  const answeredList = session.get("answered") || [];
  const correct = answeredList.includes(questionId);
  const location = LOCATION_LIST[questionId];
  
  const message = correct ? CORRECT_ANSWER_MESSAGES[name][location] : "";
  const codeLetter = CODEWORDS[name][questionId];
  console.log(message)
  return { questionId, name, correct, message, codeLetter };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
  const answer = formData.get("answer");
  if (!answer) {
    return { correct: false, message: "NO ANSWER" };
  }
  const questionId = parseInt(params.questionId);
  const session = await getSession(request.headers.get("Cookie"));
  let name = session.get("name");
  if (name.toUpperCase() !== "MARLIES" && name.toUpperCase() !== "ROAN") {
    name = `ROAN`
    // TODO: SHOW ERROR MESSAGE
    // return { error: true, message: "ACCESS DENIED" };
  }
  const answers = ANSWERS[name.toUpperCase() as keyof typeof ANSWERS];
  const location = LOCATION_LIST[questionId] as keyof typeof answers;
  const correctAnswer = answers[location].toString().toLowerCase();

  if (answer.toString().toLowerCase() != correctAnswer) {
    return { correct: false, message: "WRONG ANSWER" };
  }
  else {
    // store the questionId in the Users session. The data should be an array with questionIds: [1, 2, 3]
    const answered = session.get("answered") || [];
    if (!answered.includes(questionId)) {
      answered.push(questionId);
      session.set("answered", answered);
    }
    const message = CORRECT_ANSWER_MESSAGES[name][location];
    const codeLetter = CODEWORDS[name][questionId];

    return { 
      correct: true, 
      message,
      codeLetter,
      headers: {
        "Set-Cookie": await commitSession(session),
      },
     };
  }
}

export default function Question() {
  const { questionId, name, correct, message, codeLetter } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const location = LOCATION_LIST[questionId];

  // Show celebration if correct
  if (actionData?.correct || correct) {
    return (
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-gray-900 border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)] rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-2xl font-bold text-green-400 tracking-widest uppercase mb-2">
              CORRECT!
            </h1>
            <p className="text-gray-400 text-sm">
              {actionData?.message || message}
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border-2 border-green-500 text-white font-bold text-lg">
                {questionId + 1}
              </span>
              <span className="text-8xl font-bold text-yellow-400 tracking-widest">
                {actionData?.codeLetter || codeLetter}
              </span>
            </div>
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
