import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/home.tsx", [
    index("routes/home._index.tsx"),
    route(":questionId", "routes/question.tsx"),
  ]),
  route("success", "routes/success.tsx"),
] satisfies RouteConfig;
