#!/usr/bin/env bash
set -euo pipefail

SDK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACTS_DIR="${GISMO_CONTRACTS_DIR:-$SDK_DIR/../gismo-contracts}"
OPENAPI_GENERATOR_VERSION="7.24.0"
JSON_SCHEMA_TO_TS_VERSION="15.0.4"

if [[ ! -f "$CONTRACTS_DIR/openapi/openapi.yaml" ]]; then
  echo "error: contract not found at $CONTRACTS_DIR/openapi/openapi.yaml (set GISMO_CONTRACTS_DIR)" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "==> generating REST client (openapi-generator $OPENAPI_GENERATOR_VERSION, typescript-fetch)"
npx --yes "@openapitools/openapi-generator-cli@2.39.1" generate \
  -i "$CONTRACTS_DIR/openapi/openapi.yaml" \
  -g typescript-fetch \
  -o "$WORK_DIR/rest" \
  --additional-properties=supportsES6=true,stringEnums=true,importFileExtension=.js \
  --skip-validate-spec

rm -rf "$SDK_DIR/src/rest"
mkdir -p "$SDK_DIR/src/rest"
cp "$WORK_DIR/rest"/*.ts "$SDK_DIR/src/rest/"
cp -R "$WORK_DIR/rest/apis" "$SDK_DIR/src/rest/apis"
cp -R "$WORK_DIR/rest/models" "$SDK_DIR/src/rest/models"

echo "==> generating MCP tool models (json-schema-to-typescript $JSON_SCHEMA_TO_TS_VERSION)"
if [[ ! -d "$SDK_DIR/node_modules/json-schema-to-typescript" ]]; then
  echo "error: run 'npm install' in $SDK_DIR first (json-schema-to-typescript is a devDependency)" >&2
  exit 1
fi
mkdir -p "$SDK_DIR/src/mcp"

for pair in getState:get-state submitOrders:submit-orders surrender:surrender; do
  schema="${pair%%:*}"
  module="${pair##*:}"
  node "$SDK_DIR/scripts/generate-mcp.mjs" \
    "$CONTRACTS_DIR/mcp-schema/${schema}.schema.json" \
    "$SDK_DIR/src/mcp/${module}.ts"
done

echo "==> done. Review \`git diff\` in src/rest/ and src/mcp/ before committing."
