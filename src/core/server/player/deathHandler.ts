import { CVector3 } from "@/core/shared/CVector3";
import { SpawnData, SpawnType } from "@/core/shared/interfaces/Spawn";

export class DeathHandler {
    private static instance: DeathHandler;
    
    private readonly DEFAULT_DEATH_SPAWN: SpawnData = {
        pos:  new CVector3(213.0, -804.0, 31.0),
        heading: 180.0,
        dimension: 0,
        type: SpawnType.DEFAULT,
        camBehind: false,
        data: {}
    };

    public static getInstance(): DeathHandler {
        if (!DeathHandler.instance) {
            DeathHandler.instance = new DeathHandler();
        }
        return DeathHandler.instance;
    }

    constructor() {
        this.setupEvents();
    }

    private setupEvents(): void {
        onNet('baseevents:onPlayerDied', async () => {
            const source = (global as any).source;
            
            setTimeout(async () => {
                await this.handleRespawn(source);
            }, 3000);
        });
    }

    private async handleRespawn(source: number): Promise<void> {
        const spawnData = await this.getPlayerSpawnLocation(source);
        emitNet('spawn:doSpawn', source, spawnData);
    }

    private async getPlayerSpawnLocation(source: number): Promise<SpawnData> {
        // TODO: Hier später Ihre Logik für:
        return this.DEFAULT_DEATH_SPAWN;
    }
}