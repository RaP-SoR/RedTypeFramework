import { IPlayer } from "./IPlayer";

export interface IExtendedPlayer extends IPlayer {
  getPosition(): Promise<{ x: number; y: number; z: number }>;
  getHeading(): Promise<number>;

  getHealth(): Promise<number>;
  setHealth(health: number): void;
}

export interface IPlayerFactory {
  createPlayer(source: number): IPlayer;
  createExtendedPlayer(source: number): IExtendedPlayer;
}
