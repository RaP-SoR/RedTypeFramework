import { ServerConfig } from "@rtf/shared/interfaces/ServerConfig";
import { DatabaseFactory } from "./db/index";
import { IDatabaseProvider } from "@rtf/shared/interfaces/IDatabaseProvider";
import { logError, logInfo } from "../shared/logs";

export class ServerCore {
  private config: ServerConfig;
  private dbProvider: IDatabaseProvider | null = null;

  constructor(config: ServerConfig) {
    this.config = config;
    logInfo("RedType Framework Server initialized");
  }

  public async start(): Promise<void> {
    logInfo("Starting RedType Framework Server...");
    await this.initializeDatabase();
    logInfo("RedM Framework Server started successfully");
  }

  public async stop(): Promise<void> {
    logInfo("Stopping RedM Framework Server...");
    
    if (this.dbProvider && await this.dbProvider.isConnected()) {
      await this.dbProvider.disconnect();
    }
    logInfo("RedM Framework Server stopped");
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
  
  public isDebugMode(): boolean {
    return this.config.debug;
  }
}
 
