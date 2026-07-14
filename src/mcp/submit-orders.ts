export interface TankOrder {
  tankId: number;
  speed: number;
  heading: number;
  turretHold: boolean;
  turretHeading: number;
  fire: boolean;
  targetX: number;
  targetY: number;
}
export interface SubmitOrdersRequest {
  matchId: string;
  impulse: number;
}
export interface SubmitOrdersResponse {
  impulse: number;
  orders: TankOrder[];
}
