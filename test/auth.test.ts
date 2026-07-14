// Smoke test for the hand-written auth layer.
//
// TypeScript's generated REST models are plain interfaces with no runtime
// representation, so the meaningful thing to verify at runtime isn't model
// shape (tsc's structural typing already guarantees that at build time) but
// the one piece of hand-written glue: that a token passed to newClient ends
// up on the wire as `Authorization: Bearer <token>`.
import assert from "node:assert/strict";
import { test } from "node:test";

import { newClient } from "../src/auth.js";
import { TeamsApi } from "../src/rest/apis/TeamsApi.js";
import { Configuration } from "../src/rest/runtime.js";

test("newClient resolves accessToken to the supplied token", async () => {
  const configuration = newClient({ token: "gismo_pat_example" });
  const resolved = await configuration.accessToken?.("bearerAuth", []);
  assert.equal(resolved, "gismo_pat_example");
});

test("a configured API class sends the resolved token as a Bearer header", async () => {
  const seenHeaders: Record<string, string>[] = [];
  const configuration = new Configuration({
    accessToken: "gismo_pat_example",
    fetchApi: async (_url, init) => {
      seenHeaders.push({ ...(init?.headers as Record<string, string>) });
      return new Response(JSON.stringify({ items: [], next_page_token: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await new TeamsApi(configuration).listTeams();

  assert.equal(seenHeaders.length, 1);
  assert.equal(seenHeaders[0]!["Authorization"], "Bearer gismo_pat_example");
});
