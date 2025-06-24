import { CVector3 } from "../../shared/CVector3";
import { logInfo, logError } from "../../shared/logs";
import {
  IPlayer,
  PlayerSpawnData,
  PlayerData,
} from "../../shared/interfaces/IPlayer";

export class Player implements IPlayer {
  private source: number;
  private identifier: string;
  private name: string;
  private spawned: boolean = false;

  constructor(source: number) {
    this.source = source;
    this.name = GetPlayerName(source);
    this.identifier = this.getPlayerIdentifier();
  }

  private getPlayerIdentifier(): string {
    const identifiers = getPlayerIdentifiers(this.source);

    for (const identifier of identifiers) {
      if (identifier.startsWith("license:")) {
        return identifier;
      }
    }

    for (const identifier of identifiers) {
      if (identifier.startsWith("steam:")) {
        return identifier;
      }
    }

    return identifiers[0] || `temp:${this.source}`;
  }

  public getSource(): number {
    return this.source;
  }

  public getName(): string {
    return this.name;
  }

  public getIdentifier(): string {
    return this.identifier;
  }

  public isSpawned(): boolean {
    return this.spawned;
  }

  public async spawn(spawnData: PlayerSpawnData): Promise<void> {
    try {
      logInfo(`Spawning player ${this.name} (${this.source})`);

      const model = spawnData.model || "mp_m_freemode_01";

      // Sende Spawn-Daten an Client
      emitNet("ctf:spawnPlayer", this.source, {
        position: spawnData.position.toObject(),
        heading: spawnData.heading,
        model: model,
      });

      this.spawned = true;
      logInfo(
        `Player ${this.name} spawned at ${spawnData.position.toString()}`
      );
    } catch (error) {
      logError(`Failed to spawn player ${this.name}:`, error);
      throw error;
    }
  }

  public teleport(position: CVector3, heading?: number): void {
    if (!this.spawned) {
      logError(`Cannot teleport player ${this.name}: not spawned`);
      return;
    }

    emitNet("ctf:teleportPlayer", this.source, {
      position: position.toObject(),
      heading: heading || 0,
    });

    logInfo(`Player ${this.name} teleported to ${position.toString()}`);
  }

  public setModel(model: string): void {
    if (!this.spawned) {
      logError(`Cannot set model for player ${this.name}: not spawned`);
      return;
    }

    emitNet("ctf:setPlayerModel", this.source, model);
    logInfo(`Player ${this.name} model set to ${model}`);
  }
  public kick(reason?: string): void {
    DropPlayer(this.source.toString(), reason || "Kicked by server");
    logInfo(`Player ${this.name} kicked: ${reason || "No reason"}`);
  }

  public sendMessage(
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ): void {
    emitNet("ctf:sendMessage", this.source, {
      message,
      type,
    });
  }
  public toJSON(): PlayerData {
    return {
      source: this.source,
      name: this.name,
      identifier: this.identifier,
      spawned: this.spawned,
    };
  }
}
