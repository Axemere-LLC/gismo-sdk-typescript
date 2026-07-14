#!/usr/bin/env node
// json-schema-to-typescript's ref resolver misidentifies getState.schema.json's
// GetStateRequest/GetStateResponse (both plain `{"$ref": "#/$defs/StateView"}`
// aliases) as circular, because dereferencing them makes the same StateView
// object reachable via two paths in the same $defs bag. Compiling each "real"
// object def with only the other object defs as context (never the aliases)
// avoids that path entirely; alias defs are emitted as plain TS type aliases
// instead of being compiled.
import { compile } from "json-schema-to-typescript";
import { readFile, writeFile } from "node:fs/promises";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("usage: generate-mcp.mjs <input.schema.json> <output.ts>");
  process.exit(1);
}

const doc = JSON.parse(await readFile(inputPath, "utf8"));
const defs = doc.$defs ?? {};

const isAlias = (defSchema) =>
  Object.keys(defSchema).length === 1 && typeof defSchema.$ref === "string";
const aliasTarget = (defSchema) => defSchema.$ref.replace(/^#\/\$defs\//, "");

const objectDefs = Object.fromEntries(
  Object.entries(defs).filter(([, schema]) => !isAlias(schema)),
);

let output = "";
for (const [name, defSchema] of Object.entries(defs)) {
  if (isAlias(defSchema)) {
    output += `export type ${name} = ${aliasTarget(defSchema)};\n\n`;
    continue;
  }
  const schema = { $schema: doc.$schema, $defs: objectDefs, ...defSchema };
  output += await compile(schema, name, {
    bannerComment: "",
    additionalProperties: false,
    declareExternallyReferenced: false,
  });
}

await writeFile(outputPath, output);
