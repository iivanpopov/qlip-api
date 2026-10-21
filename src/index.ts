import { honoLogger } from "@logtape/hono";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import "./lib/logger";

const app = new Hono();

app.use(honoLogger({ category: ["robocoins", "http"], context: true }));

app.get("/", (c) => c.redirect("/docs"));
app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: { info: { title: "Robocoins Services", version: "1.0.0" } },
  }),
);
app.get("/docs", Scalar({ url: "/openapi" }));

export default app;
