import { Vector3 } from "../Vector3";

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
  pos: Vector3;
  rot?: Vector3;
  type: EntityType;
  streamDistance: number;
  dimension?: number;
  scale?: number;
  data?: Record<string, any>;
}
