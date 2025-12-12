/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as aiTools from "../aiTools.js";
import type * as aiUsage from "../aiUsage.js";
import type * as analytics from "../analytics.js";
import type * as api_adminHelpers from "../api/adminHelpers.js";
import type * as api_auth from "../api/auth.js";
import type * as api_helpers from "../api/helpers.js";
import type * as api_mutations from "../api/mutations.js";
import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as budgetItems from "../budgetItems.js";
import type * as eventApplications from "../eventApplications.js";
import type * as eventSponsors from "../eventSponsors.js";
import type * as eventTasks from "../eventTasks.js";
import type * as eventVendors from "../eventVendors.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as lib_agent_handlers from "../lib/agent/handlers.js";
import type * as lib_agent_index from "../lib/agent/index.js";
import type * as lib_agent_tools from "../lib/agent/tools.js";
import type * as lib_agent_types from "../lib/agent/types.js";
import type * as lib_ai_factory from "../lib/ai/factory.js";
import type * as lib_ai_index from "../lib/ai/index.js";
import type * as lib_ai_providers_openai from "../lib/ai/providers/openai.js";
import type * as lib_ai_types from "../lib/ai/types.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as moderation from "../moderation.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_superadmin from "../mutations/superadmin.js";
import type * as organizerProfiles from "../organizerProfiles.js";
import type * as publicApplications from "../publicApplications.js";
import type * as queries_auth from "../queries/auth.js";
import type * as queries_dashboard from "../queries/dashboard.js";
import type * as sponsors from "../sponsors.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  aiTools: typeof aiTools;
  aiUsage: typeof aiUsage;
  analytics: typeof analytics;
  "api/adminHelpers": typeof api_adminHelpers;
  "api/auth": typeof api_auth;
  "api/helpers": typeof api_helpers;
  "api/mutations": typeof api_mutations;
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  budgetItems: typeof budgetItems;
  eventApplications: typeof eventApplications;
  eventSponsors: typeof eventSponsors;
  eventTasks: typeof eventTasks;
  eventVendors: typeof eventVendors;
  events: typeof events;
  http: typeof http;
  inquiries: typeof inquiries;
  "lib/agent/handlers": typeof lib_agent_handlers;
  "lib/agent/index": typeof lib_agent_index;
  "lib/agent/tools": typeof lib_agent_tools;
  "lib/agent/types": typeof lib_agent_types;
  "lib/ai/factory": typeof lib_ai_factory;
  "lib/ai/index": typeof lib_ai_index;
  "lib/ai/providers/openai": typeof lib_ai_providers_openai;
  "lib/ai/types": typeof lib_ai_types;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  moderation: typeof moderation;
  "mutations/events": typeof mutations_events;
  "mutations/superadmin": typeof mutations_superadmin;
  organizerProfiles: typeof organizerProfiles;
  publicApplications: typeof publicApplications;
  "queries/auth": typeof queries_auth;
  "queries/dashboard": typeof queries_dashboard;
  sponsors: typeof sponsors;
  users: typeof users;
  vendors: typeof vendors;
  webhooks: typeof webhooks;
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
