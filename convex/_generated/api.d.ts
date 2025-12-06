/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_agent from "../actions/agent.js";
import type * as actions_ai from "../actions/ai.js";
import type * as aiConversations from "../aiConversations.js";
import type * as auth from "../auth.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as lib_agent_handlers from "../lib/agent/handlers.js";
import type * as lib_agent_index from "../lib/agent/index.js";
import type * as lib_agent_tools from "../lib/agent/tools.js";
import type * as lib_agent_types from "../lib/agent/types.js";
import type * as mutations_auth from "../mutations/auth.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_superadmin from "../mutations/superadmin.js";
import type * as organizerProfiles from "../organizerProfiles.js";
import type * as queries_auth from "../queries/auth.js";
import type * as queries_dashboard from "../queries/dashboard.js";
import type * as sponsors from "../sponsors.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/agent": typeof actions_agent;
  "actions/ai": typeof actions_ai;
  aiConversations: typeof aiConversations;
  auth: typeof auth;
  events: typeof events;
  http: typeof http;
  "lib/agent/handlers": typeof lib_agent_handlers;
  "lib/agent/index": typeof lib_agent_index;
  "lib/agent/tools": typeof lib_agent_tools;
  "lib/agent/types": typeof lib_agent_types;
  "mutations/auth": typeof mutations_auth;
  "mutations/events": typeof mutations_events;
  "mutations/superadmin": typeof mutations_superadmin;
  organizerProfiles: typeof organizerProfiles;
  "queries/auth": typeof queries_auth;
  "queries/dashboard": typeof queries_dashboard;
  sponsors: typeof sponsors;
  users: typeof users;
  vendors: typeof vendors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
