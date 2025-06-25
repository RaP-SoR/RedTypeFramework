import { CVector3 } from "../../shared/CVector3";
import { SpawnData, SpawnType } from "../../shared/interfaces/Spawn";
import { logInfo } from "@shared/logs";

export class SpawnHandler {
    private static instance: SpawnHandler;
    private spawnedPlayers: Set<number> = new Set();
    
    private readonly DEFAULT_SPAWN: SpawnData = {
        pos: new CVector3(213.0, -804.0, 31.0),
        heading: 180.0,
        dimension: 0,
        type: SpawnType.DEFAULT,
        camBehind: false,
    };

    public static getInstance(): SpawnHandler {
        if (!SpawnHandler.instance) {
            SpawnHandler.instance = new SpawnHandler();
        }
        return SpawnHandler.instance;
    }

    constructor() {
        this.setupEvents();
        logInfo("SpawnHandler: Server spawn handler initialized");
    }

    private setupEvents(): void {
        logInfo("SpawnHandler: Setting up server events");
    
        onNet('playerSpawning', (spawnInfo: any) => {
            const source = (global as any).source;
            logInfo(`SpawnHandler: Player ${source} spawning event triggered`);
            this.handleInitialSpawn(source);
        });
    
        onNet('playerDropped', () => {
            const source = (global as any).source;
            this.spawnedPlayers.delete(source);
            logInfo(`SpawnHandler: Player ${source} disconnected, removed from spawn list`);
        });
    
        onNet('spawn:requestInitialSpawn', () => {
            const source = (global as any).source;
            
            if (this.spawnedPlayers.has(source)) {
                logInfo(`SpawnHandler: Player ${source} already spawned, ignoring duplicate request`);
                return;
            }
            
            logInfo(`SpawnHandler: Player ${source} requested manual spawn`);
            this.handleInitialSpawn(source);
        });

        onNet('baseevents:onPlayerDied', () => {
            const source = (global as any).source;
            logInfo(`SpawnHandler: Player ${source} died, handling respawn`);
            
            setTimeout(() => {
                this.handleRespawn(source);
            }, 3000);
        });
    }
    
    private async handleInitialSpawn(source: number): Promise<void> {
        logInfo(`SpawnHandler: Handling initial spawn for player ${source}`);
        
        const spawnData = await this.getInitialSpawnLocation(source);
        logInfo(`SpawnHandler: Sending spawn data to player ${source}`);
        
        emitNet('spawn:doSpawn', source, spawnData);
        
        this.spawnedPlayers.add(source);
    }

    private async handleRespawn(source: number): Promise<void> {
        logInfo(`SpawnHandler: Handling respawn for player ${source}`);
        
        this.spawnedPlayers.delete(source);
        
        const spawnData = await this.getRespawnLocation(source);
        emitNet('spawn:doSpawn', source, spawnData);
        
        this.spawnedPlayers.add(source);
    }

    private async getInitialSpawnLocation(source: number): Promise<SpawnData> {
        // TODO: Later implement database lookup for:
        // - House spawn
        // - Faction spawn  
        // - Last logout position
        
        return this.DEFAULT_SPAWN;
    }

    private async getRespawnLocation(source: number): Promise<SpawnData> {
        // TODO: Later implement hospital/respawn points
        // For now use same as initial spawn
        
        return this.DEFAULT_SPAWN;
    }

    // Public methods for external use
    public async spawnPlayerAt(source: number, spawnData: SpawnData): Promise<void> {
        logInfo(`SpawnHandler: Manual spawn request for player ${source}`);
        emitNet('spawn:doSpawn', source, spawnData);
        this.spawnedPlayers.add(source);
    }

    public isPlayerSpawned(source: number): boolean {
        return this.spawnedPlayers.has(source);
    }

    public getSpawnedPlayersCount(): number {
        return this.spawnedPlayers.size;
    }
}

