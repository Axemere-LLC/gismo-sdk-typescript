# gismo-sdk-typescript

Public repo, created private-first (flips public at a later reveal milestone).

Generated TypeScript client for the Gismo Control-Plane API and MCP tool surface, published to npm.
This SDK is generated from the contract in `gismo-contracts`, not hand-written — a bot opens a PR here
on every contract change, reviewed by a human before merge.

## Layout

- `src/rest/` — generated REST client for the Control-Plane API (`openapi-generator`,
  `typescript-fetch`), covering organizations, users, teams, agents, agent versions, matches,
  leaderboards, and disputes
- `src/mcp/` — generated TypeScript models for the MCP tool surface (`json-schema-to-typescript`),
  covering `getState`, `submitOrders`, and `surrender`
- `src/auth.ts` — the one hand-written module: builds a `Configuration` with a caller-supplied Personal
  API Token or Clerk JWT injected as `Authorization: Bearer <token>` (no refresh/rotation logic — see
  `sdk-design.md#auth-wiring` in `gismo-platform`)
- `scripts/generate.sh` / `scripts/generate-mcp.mjs` — regenerate `src/rest/` and `src/mcp/` from the
  published contract in the sibling `gismo-contracts` repo
- `test/auth.test.ts` — verifies a token passed to `newClient` reaches the wire as
  `Authorization: Bearer <token>`
- `test/mcp.test.ts` — parses the canned MCP example payloads from `gismo-contracts/examples/` and
  validates them against the published JSON Schema; assigning each payload to its generated type also
  gives a compile-time check that the model shapes match

## Using this repo

```typescript
import { newClient, TeamsApi } from "@gismo/sdk";

const configuration = newClient({ token: "gismo_pat_..." });
const teamsApi = new TeamsApi(configuration);
```

Regenerate from the published contract (requires a sibling `gismo-contracts` checkout, or set
`GISMO_CONTRACTS_DIR`):

```
make generate
make drift-check   # fails if regenerating produces an uncommitted diff
make test
```

## License

Apache 2.0 — see `LICENSE`.

## Status

REST client and MCP models generated and committed, PAT/JWT auth layer and smoke tests passing, per
Phase 3 of the roadmap (see `implementation-roadmap.md` in `gismo-platform`). Not published to npm and
no CI workflows yet — both deferred (publishing gates on a later reveal milestone; CI/CD lands in
Phase 7).
