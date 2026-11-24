"use client";

import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client (same origin as the app, so no base URL needed). */
export const authClient = createAuthClient();
