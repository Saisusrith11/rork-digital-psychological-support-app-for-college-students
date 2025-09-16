// Type-only exports that are safe to import on client
// This file contains no server-specific code

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./app-router";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;