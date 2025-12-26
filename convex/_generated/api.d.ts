/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountLockout from "../accountLockout.js";
import type * as admin from "../admin.js";
import type * as adminAnalytics from "../adminAnalytics.js";
import type * as adminNotifications from "../adminNotifications.js";
import type * as aiTools from "../aiTools.js";
import type * as aiUsage from "../aiUsage.js";
import type * as analytics from "../analytics.js";
import type * as apiKeys from "../apiKeys.js";
import type * as api_adminHelpers from "../api/adminHelpers.js";
import type * as api_auth from "../api/auth.js";
import type * as api_helpers from "../api/helpers.js";
import type * as api_mutations from "../api/mutations.js";
import type * as attendees from "../attendees.js";
import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as budgetItems from "../budgetItems.js";
import type * as crons from "../crons.js";
import type * as customAuth from "../customAuth.js";
import type * as emailVerification from "../emailVerification.js";
import type * as eventApplications from "../eventApplications.js";
import type * as eventSponsors from "../eventSponsors.js";
import type * as eventTasks from "../eventTasks.js";
import type * as eventVendors from "../eventVendors.js";
import type * as events from "../events.js";
import type * as exports from "../exports.js";
import type * as globalRateLimit from "../globalRateLimit.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as lib_agent_handlers from "../lib/agent/handlers.js";
import type * as lib_agent_index from "../lib/agent/index.js";
import type * as lib_agent_tools from "../lib/agent/tools.js";
import type * as lib_agent_types from "../lib/agent/types.js";
import type * as lib_ai_enhancePlaygroundData from "../lib/ai/enhancePlaygroundData.js";
import type * as lib_ai_factory from "../lib/ai/factory.js";
import type * as lib_ai_index from "../lib/ai/index.js";
import type * as lib_ai_providers_openai from "../lib/ai/providers/openai.js";
import type * as lib_ai_types from "../lib/ai/types.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_emailValidation from "../lib/emailValidation.js";
import type * as lib_errorLogging from "../lib/errorLogging.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_notificationEmails from "../lib/notificationEmails.js";
import type * as lib_notificationTriggers from "../lib/notificationTriggers.js";
import type * as lib_passwordValidation from "../lib/passwordValidation.js";
import type * as migrations_clearAuthData from "../migrations/clearAuthData.js";
import type * as migrations_migrateSessionsToNewSchema from "../migrations/migrateSessionsToNewSchema.js";
import type * as moderation from "../moderation.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_superadmin from "../mutations/superadmin.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as organizations from "../organizations.js";
import type * as organizerProfiles from "../organizerProfiles.js";
import type * as passwordReset from "../passwordReset.js";
import type * as platformSettings from "../platformSettings.js";
import type * as playground from "../playground.js";
import type * as playgroundCreate from "../playgroundCreate.js";
import type * as promoCodes from "../promoCodes.js";
import type * as publicApplications from "../publicApplications.js";
import type * as queries_auth from "../queries/auth.js";
import type * as queries_dashboard from "../queries/dashboard.js";
import type * as sponsors from "../sponsors.js";
import type * as stripe from "../stripe.js";
import type * as testJWKS from "../testJWKS.js";
import type * as testKeyFormat from "../testKeyFormat.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as twoFactorAuth from "../twoFactorAuth.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountLockout: typeof accountLockout;
  admin: typeof admin;
  adminAnalytics: typeof adminAnalytics;
  adminNotifications: typeof adminNotifications;
  aiTools: typeof aiTools;
  aiUsage: typeof aiUsage;
  analytics: typeof analytics;
  apiKeys: typeof apiKeys;
  "api/adminHelpers": typeof api_adminHelpers;
  "api/auth": typeof api_auth;
  "api/helpers": typeof api_helpers;
  "api/mutations": typeof api_mutations;
  attendees: typeof attendees;
  auditLog: typeof auditLog;
  auth: typeof auth;
  budgetItems: typeof budgetItems;
  crons: typeof crons;
  customAuth: typeof customAuth;
  emailVerification: typeof emailVerification;
  eventApplications: typeof eventApplications;
  eventSponsors: typeof eventSponsors;
  eventTasks: typeof eventTasks;
  eventVendors: typeof eventVendors;
  events: typeof events;
  exports: typeof exports;
  globalRateLimit: typeof globalRateLimit;
  http: typeof http;
  inquiries: typeof inquiries;
  "lib/agent/handlers": typeof lib_agent_handlers;
  "lib/agent/index": typeof lib_agent_index;
  "lib/agent/tools": typeof lib_agent_tools;
  "lib/agent/types": typeof lib_agent_types;
  "lib/ai/enhancePlaygroundData": typeof lib_ai_enhancePlaygroundData;
  "lib/ai/factory": typeof lib_ai_factory;
  "lib/ai/index": typeof lib_ai_index;
  "lib/ai/providers/openai": typeof lib_ai_providers_openai;
  "lib/ai/types": typeof lib_ai_types;
  "lib/auth": typeof lib_auth;
  "lib/emailValidation": typeof lib_emailValidation;
  "lib/errorLogging": typeof lib_errorLogging;
  "lib/errors": typeof lib_errors;
  "lib/notificationEmails": typeof lib_notificationEmails;
  "lib/notificationTriggers": typeof lib_notificationTriggers;
  "lib/passwordValidation": typeof lib_passwordValidation;
  "migrations/clearAuthData": typeof migrations_clearAuthData;
  "migrations/migrateSessionsToNewSchema": typeof migrations_migrateSessionsToNewSchema;
  moderation: typeof moderation;
  "mutations/events": typeof mutations_events;
  "mutations/superadmin": typeof mutations_superadmin;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  orders: typeof orders;
  organizations: typeof organizations;
  organizerProfiles: typeof organizerProfiles;
  passwordReset: typeof passwordReset;
  platformSettings: typeof platformSettings;
  playground: typeof playground;
  playgroundCreate: typeof playgroundCreate;
  promoCodes: typeof promoCodes;
  publicApplications: typeof publicApplications;
  "queries/auth": typeof queries_auth;
  "queries/dashboard": typeof queries_dashboard;
  sponsors: typeof sponsors;
  stripe: typeof stripe;
  testJWKS: typeof testJWKS;
  testKeyFormat: typeof testKeyFormat;
  ticketTypes: typeof ticketTypes;
  twoFactorAuth: typeof twoFactorAuth;
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
