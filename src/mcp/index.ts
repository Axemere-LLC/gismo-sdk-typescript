// MCP tool-surface typed models generated from gismo-contracts/mcp-schema/*.schema.json.
//
// Only the request/response/nested models are re-exported here; the
// generated echo-wrapper aliases (GetStateRequest/GetStateResponse) are
// internal to get-state.ts.
export type { BlockhouseView, StateView, TankView } from "./get-state.js";
export type {
  SubmitOrdersRequest,
  SubmitOrdersResponse,
  TankOrder,
} from "./submit-orders.js";
export type { SurrenderRequest, SurrenderResponse } from "./surrender.js";
