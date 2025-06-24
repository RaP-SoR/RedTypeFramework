import { CVector3 } from "../../shared/CVector3";

export interface PlayerSpawnData {
  position: CVector3;
  heading: number;
  model?: string;
}

export interface PlayerData {
  source: number;
  name: string;
  identifier: string;
  spawned: boolean;
}

export interface IPlayer {
  getSource(): number;
  getName(): string;
  getIdentifier(): string;
  isSpawned(): boolean;

  spawn(spawnData: PlayerSpawnData): Promise<void>;
  teleport(position: CVector3, heading?: number): void;
  setModel(model: string): void;
  kick(reason?: string): void;

  sendMessage(
    message: string,
    type?: "info" | "success" | "error" | "warning"
  ): void;

  toJSON(): PlayerData;
}
