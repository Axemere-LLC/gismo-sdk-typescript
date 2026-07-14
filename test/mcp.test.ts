// Smoke test for the generated MCP tool-surface models.
//
// The generated types (StateView, SubmitOrdersRequest/Response, ...) are
// plain interfaces with no runtime footprint, so there's nothing to
// construct or round-trip the way the Python SDK's Pydantic models do.
// What's actually worth checking at runtime is that the canned example
// payloads published in gismo-contracts/examples/ validate against the
// published JSON Schema — the same non-Go validation approach the
// gismo-contracts README recommends for SDKs that can't call its Go
// conformance harness directly. Assigning each payload to its generated
// type also gives a compile-time check that the model shapes match.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ajv and ajv-formats are CJS packages with no package.json "exports" map, so
// under moduleResolution NodeNext their .d.ts (written with ESM `export
// default` syntax) resolves with implied CommonJS format, and TypeScript's
// default-import interop collapses `default` to the whole module namespace
// instead of the intended export — both `import Ajv from "ajv"` and
// `namespaceImport.default` type as non-constructable/non-callable. Ajv's
// class is also a named export, so import it by name; ajv-formats has no
// named alternative, so load it via `require` (typed against its own default
// export) to sidestep ESM default-import interop entirely.
//
// The published JSON Schema declares "$schema": draft/2020-12, which plain
// Ajv doesn't ship a meta-schema for — Ajv2020 (also a named export) bundles
// it.
import { Ajv2020 } from "ajv/dist/2020.js";
const require = createRequire(import.meta.url);
const addFormats: typeof import("ajv-formats").default = require("ajv-formats");

import type { StateView } from "../src/mcp/get-state.js";
import type {
  SubmitOrdersRequest,
  SubmitOrdersResponse,
} from "../src/mcp/submit-orders.js";
import type { SurrenderRequest, SurrenderResponse } from "../src/mcp/surrender.js";

// This test runs from the compiled dist/test/mcp.test.js, one directory
// level deeper than the source test/mcp.test.ts, hence the extra "..".
const SDK_DIR = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..");
const CONTRACTS_DIR =
  process.env.GISMO_CONTRACTS_DIR ?? path.join(SDK_DIR, "..", "gismo-contracts");

async function loadJson(...segments: string[]): Promise<any> {
  return JSON.parse(await readFile(path.join(CONTRACTS_DIR, ...segments), "utf8"));
}

// Each call spreads the same schema document under its unmodified top-level
// $id, so compiling more than one $def from the same document on one Ajv
// instance collides on "$id already exists". A JSON Schema $id can't carry a
// fragment to disambiguate (only a bare "#"), so drop $id entirely instead —
// $ref: "#/$defs/..." is an in-document pointer and resolves the same on an
// anonymous schema.
function schemaRefToDef(schemaDoc: any, defName: string) {
  const { $id, ...rest } = schemaDoc;
  return { ...rest, $ref: `#/$defs/${defName}` };
}

function makeValidator() {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  return ajv;
}

async function contractsExist(): Promise<boolean> {
  try {
    await readFile(path.join(CONTRACTS_DIR, "mcp-schema", "getState.schema.json"));
    return true;
  } catch {
    return false;
  }
}

const skip = !(await contractsExist());

test("getState example validates against StateView", { skip }, async () => {
  const schemaDoc = await loadJson("mcp-schema", "getState.schema.json");
  const example: StateView = await loadJson("examples", "getState.json");

  const ajv = makeValidator();
  const validate = ajv.compile(schemaRefToDef(schemaDoc, "StateView"));
  assert.equal(validate(example), true, ajv.errorsText(validate.errors));
});

test(
  "submitOrders example validates against SubmitOrdersRequest/Response",
  { skip },
  async () => {
    const schemaDoc = await loadJson("mcp-schema", "submitOrders.schema.json");
    const example: { request: SubmitOrdersRequest; response: SubmitOrdersResponse } =
      await loadJson("examples", "submitOrders.json");

    const ajv = makeValidator();
    const validateRequest = ajv.compile(schemaRefToDef(schemaDoc, "SubmitOrdersRequest"));
    const validateResponse = ajv.compile(schemaRefToDef(schemaDoc, "SubmitOrdersResponse"));

    assert.equal(validateRequest(example.request), true, ajv.errorsText(validateRequest.errors));
    assert.equal(validateResponse(example.response), true, ajv.errorsText(validateResponse.errors));
  },
);

test(
  "surrender example validates against SurrenderRequest/Response",
  { skip },
  async () => {
    const schemaDoc = await loadJson("mcp-schema", "surrender.schema.json");
    const example: { request: SurrenderRequest; response: SurrenderResponse } =
      await loadJson("examples", "surrender.json");

    const ajv = makeValidator();
    const validateRequest = ajv.compile(schemaRefToDef(schemaDoc, "SurrenderRequest"));
    const validateResponse = ajv.compile(schemaRefToDef(schemaDoc, "SurrenderResponse"));

    assert.equal(validateRequest(example.request), true, ajv.errorsText(validateRequest.errors));
    assert.equal(validateResponse(example.response), true, ajv.errorsText(validateResponse.errors));
  },
);
