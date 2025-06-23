import { CVector3 } from "../CVector3";

export type EntityType =
  | "player"
  | "label"
  | "object"
  | "blip"
  | "marker"
  | "colshape"
  | "ped";

export interface IEntity {
  id: string;
  name?: string;
  pos: CVector3;
  rot?: CVector3;
  type: EntityType;
  streamDistance: number;
  dimension?: number;
  scale?: number;
  data?: Record<string, any>;
}
