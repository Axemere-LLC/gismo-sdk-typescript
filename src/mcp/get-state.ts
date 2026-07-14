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
export interface TerrainView {
  x: number;
  y: number;
  /**
   * 0=Plain, 1=Forest, 2=Water, 3=Mountain. Only non-Plain cells are ever sent.
   */
  type: number;
}
export interface StateView {
  matchId: string;
  impulse: number;
  /**
   * The complete static terrain map, identical for both sides and never Line-of-Sight gated (unlike visibleTanks/blockhouses). Only non-Plain cells are included.
   */
  terrain: TerrainView[];
  ownTanks: TankView[];
  visibleTanks: TankView[];
  blockhouses: BlockhouseView[];
}
export type GetStateRequest = StateView;

export type GetStateResponse = StateView;

