import { Player } from "./Player";
import { IPlayer, PlayerSpawnData } from "../../shared/interfaces/IPlayer";
import { IPlayerManager } from "../../shared/interfaces/IPlayerManager";
import { CVector3 } from "../../shared/CVector3";
import { logInfo, logError } from "../../shared/logs";

export class PlayerManager implements IPlayerManager {
  private static instance: PlayerManager;
  private players: Map<number, IPlayer> = new Map();

  private constructor() {
    this.setupEvents();
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  private setupEvents(): void {
    on(
      "playerConnecting",
      (name: string, setKickReason: Function, deferrals: any) => {
        const source = global.source as number;
        logInfo(`Player ${name} connecting (source: ${source})`);

        deferrals.defer();
        deferrals.update(`Willkommen ${name}, lade Charakterdaten...`);

        setTimeout(() => {
          deferrals.done();
        }, 1000);
      }
    );

    on("playerJoining", (oldId: string) => {
      const source = global.source as number;
      const player = new Player(source);

      this.players.set(source, player);
      logInfo(`Player ${player.getName()} joined (${player.getIdentifier()})`);

      // Auto-Spawn nach kurzer Verzögerung
      setTimeout(() => {
        this.spawnPlayer(source);
      }, 2000);
    });

    on("playerDropped", (reason: string) => {
      const source = global.source as number;
      const player = this.players.get(source);

      if (player) {
        logInfo(`Player ${player.getName()} disconnected: ${reason}`);
        this.players.delete(source);
      }
    });

    onNet("ctf:requestSpawn", () => {
      const source = global.source as number;
      this.spawnPlayer(source);
    });

    onNet("ctf:playerSpawned", () => {
      const source = global.source as number;
      const player = this.getPlayer(source);
      if (player) {
        logInfo(`Player ${player.getName()} successfully spawned`);
      }
    });
  }
  public getPlayer(source: number): IPlayer | undefined {
    return this.players.get(source);
  }

  public getAllPlayers(): IPlayer[] {
    return Array.from(this.players.values());
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public getPlayerByIdentifier(identifier: string): IPlayer | undefined {
    for (const player of this.players.values()) {
      if (player.getIdentifier() === identifier) {
        return player;
      }
    }
    return undefined;
  }

  public async spawnPlayer(
    source: number,
    customSpawnData?: PlayerSpawnData
  ): Promise<void> {
    const player = this.getPlayer(source);
    if (!player) {
      logError(`Cannot spawn player: source ${source} not found`);
      return;
    }

    const defaultSpawnData: PlayerSpawnData = {
      position: new CVector3(-1037.45, -2737.52, 20.17), // Los Santos International Airport
      heading: 329.43,
      model: "mp_m_freemode_01",
    };

    const spawnData = customSpawnData || defaultSpawnData;

    try {
      await player.spawn(spawnData);

      setTimeout(() => {
        player.sendMessage(
          `Willkommen auf dem Server, ${player.getName()}!`,
          "success"
        );
      }, 1000);
    } catch (error) {
      logError(`Failed to spawn player ${player.getName()}:`, error);
      player.sendMessage("Fehler beim Spawnen. Versuche es erneut.", "error");
    }
  }

  public teleportPlayer(
    source: number,
    position: CVector3,
    heading?: number
  ): void {
    const player = this.getPlayer(source);
    if (player) {
      player.teleport(position, heading);
    }
  }

  public setPlayerModel(source: number, model: string): void {
    const player = this.getPlayer(source);
    if (player) {
      player.setModel(model);
    }
  }

  public kickPlayer(source: number, reason?: string): void {
    const player = this.getPlayer(source);
    if (player) {
      player.kick(reason);
    }
  }

  public broadcastMessage(
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ): void {
    for (const player of this.players.values()) {
      player.sendMessage(message, type);
    }
    logInfo(`Broadcast message: ${message}`);
  }
  public getPlayersInRange(position: CVector3, range: number): IPlayer[] {
    const playersInRange: IPlayer[] = [];

    for (const player of this.players.values()) {
      if (player.isSpawned()) {
        playersInRange.push(player);
      }
    }

    return playersInRange;
  }
}
