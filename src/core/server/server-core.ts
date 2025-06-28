import { ServerConfig } from "@shared/interfaces/ServerConfig";
import { DatabaseFactory } from "./db/DatabaseFactory";
import { IDatabaseProvider } from "@shared/interfaces/IDatabaseProvider";
import { logError, logInfo } from "@shared/logs";
import { DeathHandler } from "./player/deathHandler";
import { SpawnHandler } from "./player/spawnHandler";
import { ModuleManager } from "./ModuleManager";

export class ServerCore {
  private config: ServerConfig;
  private dbProvider: IDatabaseProvider | null = null;
  private moduleManager: ModuleManager;
  private static instance: ServerCore | null = null;

  constructor(config: ServerConfig) {
    this.config = config;
    this.moduleManager = ModuleManager.getInstance();
    ServerCore.instance = this;
    logInfo("CFXType Framework Server initialized");
  }

  public async start(): Promise<void> {
    logInfo("Starting CFXType Framework Server...");
    await this.initializeDatabase();
    SpawnHandler.getInstance();
    DeathHandler.getInstance();

    logInfo("Initializing module system...");

    logInfo("Server started successfully");
  }

  public async stop(): Promise<void> {
    logInfo("Stopping Server...");

    await this.moduleManager.shutdownAllModules();

    if (this.dbProvider && (await this.dbProvider.isConnected())) {
      await this.dbProvider.disconnect();
    }
    logInfo("Server stopped");
  }

  public getModuleManager(): ModuleManager {
    return this.moduleManager;
  }

  public getDatabaseProvider(): IDatabaseProvider {
    if (!this.dbProvider) {
      throw new Error("Database provider not initialized");
    }
    return this.dbProvider;
  }
  public getConfig(): ServerConfig {
    return this.config;
  }
  public static getInstance(): ServerCore {
    if (!ServerCore.instance) {
      throw new Error(
        "ServerCore not initialized. Please create ServerCore instance first."
      );
    }
    return ServerCore.instance;
  }

  public static hasInstance(): boolean {
    return ServerCore.instance !== null;
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

  public isDebugMode(): boolean {
    return this.config.debug;
  }
}
