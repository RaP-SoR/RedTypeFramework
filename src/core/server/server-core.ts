import { ServerConfig } from "@shared/interfaces/ServerConfig";
import { DatabaseFactory } from "./db/DatabaseFactory";
import { IDatabaseProvider } from "@shared/interfaces/IDatabaseProvider";
import { logError, logInfo } from "@shared/logs";
import { PlayerManager } from "./player/PlayerManager";
import { IPlayerManager } from "../shared/interfaces/IPlayerManager";

export class ServerCore {
  private config: ServerConfig;
  private dbProvider: IDatabaseProvider | null = null;
  private playerManager!: IPlayerManager;

  constructor(config: ServerConfig) {
    this.config = config;
    logInfo("CFXType Framework Server initialized");
  }

  public async start(): Promise<void> {
    logInfo("Starting CFXType Framework Server...");
    await this.initializeDatabase();
    this.initializePlayerManager();
    logInfo("Server started successfully");
  }

  public async stop(): Promise<void> {
    logInfo("Stopping Server...");

    if (this.dbProvider && (await this.dbProvider.isConnected())) {
      await this.dbProvider.disconnect();
    }
    logInfo("Server stopped");
  }

  public getDatabaseProvider(): IDatabaseProvider {
    if (!this.dbProvider) {
      throw new Error("Database provider not initialized");
    }
    return this.dbProvider;
  }

  private async initializeDatabase(): Promise<void> {
    if (!this.config.database) {
      throw new Error("Database configuration missing");
    }

    try {
      logInfo(`Connecting to ${this.config.database.provider} database...`);
      this.dbProvider = DatabaseFactory.createProvider(
        this.config.database.provider,
        this.config.database
      );

      await this.dbProvider.connect();
      logInfo("Database connection established");
    } catch (error) {
      logError("Failed to connect to database:", error);
      throw error;
    }
  }

  private initializePlayerManager(): void {
    logInfo("Initializing Player Manager...");
    this.playerManager = PlayerManager.getInstance();
    logInfo("Player Manager initialized");
  }
  public getPlayerManager(): IPlayerManager {
    return this.playerManager;
  }

  public isDebugMode(): boolean {
    return this.config.debug;
  }
}
