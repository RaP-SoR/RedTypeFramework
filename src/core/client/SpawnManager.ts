import { logInfo } from "@shared/logs";
import { SpawnData } from "../shared/interfaces/Spawn";

export class SpawnManager {
    private static instance: SpawnManager;
    private isSpawned = false;
    private isSpawning = false;

    public static getInstance(): SpawnManager {
        if (!SpawnManager.instance) {
            SpawnManager.instance = new SpawnManager();
        }
        return SpawnManager.instance;
    }

    constructor() {
        logInfo("SpawnManager: Instance created");
        this.setupEventHandlers();
        this.initializeClient();
    }

    private setupEventHandlers(): void {
        logInfo("SpawnManager: Setting up event handlers");

        onNet('spawn:doSpawn', (spawnData: SpawnData) => {
            logInfo("SpawnManager: Received spawn data");
            this.spawnPlayer(spawnData);
        });
    }

    private initializeClient(): void {
        setTimeout(() => {
            logInfo("SpawnManager: Client initialized, requesting spawn");
            this.requestInitialSpawn();
        }, 2000);
    }

    private async spawnPlayer(spawnData: SpawnData): Promise<void> {
        if (this.isSpawning) {
            logInfo("SpawnManager: Already spawning, ignoring request");
            return;
        }

        this.isSpawning = true;
        logInfo("SpawnManager: Starting spawn process");

        try {
            if (GetIsLoadingScreenActive()) {
                SendLoadingScreenMessage('{"fullyLoaded": true}');
                ShutdownLoadingScreenNui();
            }
            ShutdownLoadingScreen();

            NetworkStartSoloTutorialSession();
            DoScreenFadeOut(0);

            const playerId = PlayerId();
            SetPlayerControl(playerId, false, 0);
            SetPlayerInvincible(playerId, true);

            await this.setPlayerModel('mp_m_freemode_01');
            await this.wait(100);

            const ped = PlayerPedId();
            
            RequestCollisionAtCoord(spawnData.pos.x, spawnData.pos.y, spawnData.pos.z);
            SetEntityCoordsNoOffset(ped, spawnData.pos.x, spawnData.pos.y, spawnData.pos.z, false, false, false);
            SetEntityHeading(ped, spawnData.heading);

            NetworkEndTutorialSession();

            await this.loadScene(spawnData.pos.x, spawnData.pos.y, spawnData.pos.z);
            await this.setupCamera(ped);

            const finalPed = PlayerPedId();
            
            SetPlayerInvincible(playerId, false);
            SetEntityVisible(finalPed, true, false);
            SetEntityAlpha(finalPed, 255, false);
            
            ResetEntityAlpha(finalPed);
            SetPedDefaultComponentVariation(finalPed);
            
            SetPlayerControl(playerId, true, 0);
            SetEntityCollision(finalPed, true, true);
            FreezeEntityPosition(finalPed, false);
            
            SetEntityHealth(finalPed, GetEntityMaxHealth(finalPed));
            SetPedArmour(finalPed, 0);

            if (!IsPedFatallyInjured(finalPed)) {
                ClearPedTasksImmediately(finalPed);
                SetPedCanSwitchWeapon(finalPed, true);
            }

            logInfo(`SpawnManager: Player activated - PedID: ${finalPed}, Visible: ${IsEntityVisible(finalPed)}, Alpha: ${GetEntityAlpha(finalPed)}`);

            await this.wait(500);
            DoScreenFadeIn(500);

            this.isSpawned = true;
            
            logInfo("SpawnManager: Spawn completed successfully");
            emit('playerSpawned', spawnData);

        } catch (error) {
            console.error("SpawnManager: Spawn failed:", error);
        } finally {
            this.isSpawning = false;
        }
    }

    private async setPlayerModel(model: string): Promise<void> {
        logInfo(`SpawnManager: Setting player model to ${model}`);

        const hash = GetHashKey(model);
        
        if (!IsModelInCdimage(hash)) {
            console.error(`Model ${model} not found in game files, using fallback`);
            await this.setPlayerModel('a_m_y_hipster_01');
            return;
        }

        const currentPed = PlayerPedId();
        if (currentPed && currentPed !== -1) {
            SetEntityAsMissionEntity(currentPed, true, true);
            ResetEntityAlpha(currentPed);
        }

        RequestModel(hash);
        
        let attempts = 0;
        while (!HasModelLoaded(hash) && attempts < 200) {
            await this.wait(25);
            attempts++;
        }

        if (!HasModelLoaded(hash)) {
            console.error(`Failed to load model ${model} after ${attempts} attempts`);
            await this.setPlayerModel('a_m_y_hipster_01');
            return;
        }

        SetPlayerModel(PlayerId(), hash);
        await this.wait(200);
        SetModelAsNoLongerNeeded(hash);
        
        const newPed = PlayerPedId();
        if (newPed && newPed !== -1) {
            SetEntityVisible(newPed, true, false);
            SetEntityAlpha(newPed, 255, false);
            ResetEntityAlpha(newPed);
            SetPedDefaultComponentVariation(newPed);
            
            logInfo(`SpawnManager: Player model set successfully - PedID: ${newPed}, Model: ${GetEntityModel(newPed)}`);
        } else {
            console.error("SpawnManager: Failed to get new player ped after model change");
        }
    }

    private async loadScene(x: number, y: number, z: number): Promise<void> {
        if (!NewLoadSceneStart) return;

        NewLoadSceneStart(x, y, z, 0.0, 0.0, 0.0, 20.0, 0);

        const startTime = GetGameTimer();
        while (IsNewLoadSceneActive() && (GetGameTimer() - startTime) < 5000) {
            NetworkUpdateLoadScene();
            await this.wait(0);
        }
    }

    private async setupCamera(ped: number): Promise<void> {
        logInfo("SpawnManager: Setting up camera");

        RenderScriptCams(false, false, 0, true, false);
        
        SetCamActive(CreateCam("DEFAULT_SCRIPTED_CAMERA", true), false);
        DestroyCam(CreateCam("DEFAULT_SCRIPTED_CAMERA", true), false);
        
        SetGameplayCamRelativeHeading(0.0);
        SetGameplayCamRelativePitch(0.0, 1.0);
        
        SetEntityHeading(ped, GetEntityHeading(ped));
        
        await this.wait(100);
        logInfo("SpawnManager: Camera setup completed");
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private requestInitialSpawn(): void {
        if (!this.isSpawned && !this.isSpawning) {
            logInfo("SpawnManager: Requesting initial spawn");
            emitNet('spawn:requestInitialSpawn');
        }
    }

    public requestRespawn(): void {
        logInfo("SpawnManager: Manual respawn requested");
        this.isSpawned = false;
        this.requestInitialSpawn();
    }

    public isPlayerSpawned(): boolean {
        return this.isSpawned;
    }

    public isCurrentlySpawning(): boolean {
        return this.isSpawning;
    }

}

const spawnManagerInstance = SpawnManager.getInstance();

