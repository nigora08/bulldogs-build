/**
 * Shared LIVE-PREVIEW OAuth client id (server-only — NEVER import from the client).
 *
 * The sandbox serves each live preview on a dynamic `https://*.grok-sandbox.com`
 * URL, which can't be pre-registered per app. The broker accepts this public
 * client id for `https://*.grok-sandbox.com/api/auth/oauth2/callback/*`.
 * The matching client secret is never stored in the app. Broker sign-in is
 * registered only when the host injects `GROK_AUTH_CLIENT_SECRET` (see `server.ts`).
 * Email and password sign-in does not need that secret.
 */
export const PREVIEW_CLIENT_ID = "grok_preview";

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
