import { AsyncLocalStorage } from "node:async_hooks";

import { configureSync, getConsoleSink, getLogger, type LogLevel } from "@logtape/logtape";

import { isProduction } from "../config/env";

configureSync({
  contextLocalStorage: new AsyncLocalStorage(),
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ["robocoins"],
      sinks: ["console"],
      lowestLevel: isProduction ? "info" : "debug",
    },
    {
      category: ["logtape", "meta"],
      sinks: [],
    },
  ],
});

export const logger = getLogger(["robocoins"]);
