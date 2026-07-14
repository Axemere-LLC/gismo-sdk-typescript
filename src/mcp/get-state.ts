export interface TankView {
  id: number;
  side: number;
  x: number;
  y: number;
  heading: number;
  speed: number;
  turretHeading: number;
  ammo: number;
  hitsTaken: number;
}
export interface BlockhouseView {
  side: number;
  x: number;
  y: number;
  hitsTaken: number;
}
export interface StateView {
  matchId: string;
  impulse: number;
  ownTanks: TankView[];
  visibleTanks: TankView[];
  blockhouses: BlockhouseView[];
}
export type GetStateRequest = StateView;

export type GetStateResponse = StateView;

