import { IPlayer, PlayerSpawnData } from "./IPlayer";
import { CVector3 } from "../CVector3";

export interface IPlayerManager {
  getPlayer(source: number): IPlayer | undefined;
  getAllPlayers(): IPlayer[];
  getPlayerCount(): number;
  getPlayerByIdentifier(identifier: string): IPlayer | undefined;

  spawnPlayer(source: number, customSpawnData?: PlayerSpawnData): Promise<void>;
  teleportPlayer(source: number, position: CVector3, heading?: number): void;
  setPlayerModel(source: number, model: string): void;
  kickPlayer(source: number, reason?: string): void;

  broadcastMessage(
    message: string,
    type?: "info" | "success" | "error" | "warning"
  ): void;

  getPlayersInRange(position: CVector3, range: number): IPlayer[];
}
