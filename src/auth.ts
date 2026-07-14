// Thin auth-injection layer for the generated REST client.
//
// The Control-Plane API accepts either a Personal API Token or a Clerk JWT in
// the same `Authorization: Bearer <token>` header (see
// control-plane-api.md#authentication); there is no refresh/rotation logic
// here by design (see sdk-design.md#auth-wiring) — the caller supplies a
// token once.
import { Configuration } from "./rest/runtime.js";

export interface NewClientOptions {
  token: string;
  basePath?: string;
}

export function newClient(options: NewClientOptions): Configuration {
  return new Configuration({
    basePath: options.basePath,
    accessToken: options.token,
  });
}
