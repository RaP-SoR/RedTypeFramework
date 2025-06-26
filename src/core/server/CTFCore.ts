import { ServerCore } from "./server-core";
import { ModuleManager } from "./ModuleManager";
import { EntityManager } from "./entity/entityManager";
import { DatabaseFactory } from "./db/DatabaseFactory";
import { logInfo, logError, logWarning } from "@shared/logs";

export interface ICTFCore {
  // Core System Access
  getServerCore(): ServerCore;
  getModuleManager(): ModuleManager;
  getEntityManager(): typeof EntityManager;
  getDatabaseFactory(): typeof DatabaseFactory;
  
  // Utility Functions
  log: {
    info: typeof logInfo;
    error: typeof logError;
    warning: typeof logWarning;
  };
  
  // Framework Info
  getVersion(): string;
  isDebugMode(): boolean;
}

export class CTFCore implements ICTFCore {
  private static instance: CTFCore;
  private serverCore: ServerCore | null = null;
  private moduleManager: ModuleManager;

  private constructor() {
    this.moduleManager = ModuleManager.getInstance();
  }

  public static getInstance(): CTFCore {
    if (!CTFCore.instance) {
      CTFCore.instance = new CTFCore();
    }
    return CTFCore.instance;
  }

  public setServerCore(serverCore: ServerCore): void {
    this.serverCore = serverCore;
  }

  public getServerCore(): ServerCore {
    if (!this.serverCore) {
      throw new Error("ServerCore not initialized");
    }
    return this.serverCore;
  }

  public getModuleManager(): ModuleManager {
    return this.moduleManager;
  }

  public getEntityManager(): typeof EntityManager {
    return EntityManager;
  }

  public getDatabaseFactory(): typeof DatabaseFactory {
    return DatabaseFactory;
  }

  public log = {
    info: logInfo,
    error: logError,
    warning: logWarning,
  };

  public getVersion(): string {
    return GetResourceMetadata(GetCurrentResourceName(), "version", 0);
  }

  public isDebugMode(): boolean {
    return this.serverCore?.isDebugMode() || false;
  }
}

// Global export for modules
export function getCTFCore(): ICTFCore {
  return CTFCore.getInstance();
}
