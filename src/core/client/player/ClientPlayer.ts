import { CVector3 } from "../../shared/CVector3";

interface SpawnData {
  position: { x: number; y: number; z: number };
  heading: number;
  model: string;
}

interface TeleportData {
  position: { x: number; y: number; z: number };
  heading: number;
}

interface MessageData {
  message: string;
  type: "info" | "success" | "error" | "warning";
}

export class ClientPlayer {
  private isSpawned: boolean = false;
  private currentModel: string = "";

  constructor() {
    this.setupEvents();
  }

  private setupEvents(): void {
    // Server fordert Spawn an
    onNet("ctf:spawnPlayer", (spawnData: SpawnData) => {
      this.spawnPlayer(spawnData);
    });

    // Server teleportiert Spieler
    onNet("ctf:teleportPlayer", (teleportData: TeleportData) => {
      this.teleportPlayer(teleportData);
    });

    // Server ändert Model
    onNet("ctf:setPlayerModel", (model: string) => {
      this.setPlayerModel(model);
    });

    // Server sendet Nachricht
    onNet("ctf:sendMessage", (messageData: MessageData) => {
      this.showMessage(messageData);
    });
  }

  private async spawnPlayer(spawnData: SpawnData): Promise<void> {
    try {
      console.log(
        `[CTF-Client] Spawning player at ${spawnData.position.x}, ${spawnData.position.y}, ${spawnData.position.z}`
      );

      const player = PlayerId();
      const playerPed = PlayerPedId();

      // Lade Model
      await this.loadModel(spawnData.model);

      // Setze Model
      SetPlayerModel(player, GetHashKey(spawnData.model));
      SetPedDefaultComponentVariation(PlayerPedId());

      // Warte bis Model geladen ist
      await this.waitForModelToLoad();

      // Setze Position
      SetEntityCoords(
        PlayerPedId(),
        spawnData.position.x,
        spawnData.position.y,
        spawnData.position.z,
        false,
        false,
        false,
        true
      );

      // Setze Heading
      SetEntityHeading(PlayerPedId(), spawnData.heading);

      // Setze Spieler als spawned
      this.isSpawned = true;
      this.currentModel = spawnData.model;

      // Aktiviere Player-Steuerung
      FreezeEntityPosition(PlayerPedId(), false);
      SetPlayerControl(player, true, 0);

      // Informiere Server über erfolgreichen Spawn
      emitNet("ctf:playerSpawned");

      console.log(`[CTF-Client] Player spawned successfully`);
    } catch (error) {
      console.error(`[CTF-Client] Failed to spawn player:`, error);
    }
  }

  private async teleportPlayer(teleportData: TeleportData): Promise<void> {
    if (!this.isSpawned) {
      console.error(`[CTF-Client] Cannot teleport: player not spawned`);
      return;
    }

    console.log(
      `[CTF-Client] Teleporting to ${teleportData.position.x}, ${teleportData.position.y}, ${teleportData.position.z}`
    );

    SetEntityCoords(
      PlayerPedId(),
      teleportData.position.x,
      teleportData.position.y,
      teleportData.position.z,
      false,
      false,
      false,
      true
    );

    SetEntityHeading(PlayerPedId(), teleportData.heading);
  }

  private async setPlayerModel(model: string): Promise<void> {
    if (!this.isSpawned) {
      console.error(`[CTF-Client] Cannot set model: player not spawned`);
      return;
    }

    try {
      console.log(`[CTF-Client] Setting player model to ${model}`);

      await this.loadModel(model);

      const player = PlayerId();
      SetPlayerModel(player, GetHashKey(model));
      SetPedDefaultComponentVariation(PlayerPedId());

      this.currentModel = model;

      console.log(`[CTF-Client] Player model set to ${model}`);
    } catch (error) {
      console.error(`[CTF-Client] Failed to set player model:`, error);
    }
  }

  private showMessage(messageData: MessageData): void {
    // Einfache Chat-Nachricht (kann später durch UI ersetzt werden)
    const colors = {
      info: [255, 255, 255],
      success: [0, 255, 0],
      error: [255, 0, 0],
      warning: [255, 255, 0],
    };

    emit("chat:addMessage", {
      color: colors[messageData.type],
      multiline: true,
      args: ["CTF", messageData.message],
    });
  }
  private async loadModel(model: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const modelHash = GetHashKey(model);

      if (!IsModelInCdimage(modelHash)) {
        reject(new Error(`Invalid model: ${model}`));
        return;
      }

      if (HasModelLoaded(modelHash)) {
        resolve();
        return;
      }

      RequestModel(modelHash);

      const timeout = setTimeout(() => {
        reject(new Error(`Model loading timeout: ${model}`));
      }, 10000);

      const checkInterval = setInterval(() => {
        if (HasModelLoaded(modelHash)) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });
  }

  private async waitForModelToLoad(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (PlayerPedId() !== 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    });
  }

  public requestSpawn(): void {
    emitNet("ctf:requestSpawn");
  }

  public isPlayerSpawned(): boolean {
    return this.isSpawned;
  }

  public getCurrentModel(): string {
    return this.currentModel;
  }
}

// Initialisiere Client-Player
const clientPlayer = new ClientPlayer();

// Export für andere Client-Scripts
(global as any).CTF = {
  Player: clientPlayer,
};
