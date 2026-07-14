.PHONY: help generate drift-check test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "%-14s %s\n", $$1, $$2}'

generate: ## Regenerate src/rest and src/mcp from the published gismo-contracts contract
	@npm run generate

drift-check: generate ## Fail if regenerating produces a diff against committed code
	@git diff --exit-code -- src/rest src/mcp

test: ## Build and run the smoke test suite
	@npm test
