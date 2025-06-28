import { ServerCore } from "./server-core";
import { ModuleManager } from "./ModuleManager";
import { EntityManager } from "./entity/entityManager";
import { DatabaseFactory } from "./db/DatabaseFactory";
import { logInfo, logError, logWarning } from "@shared/logs";
import { ServerRPC } from "./RPC";
import * as playerUtils from "./player/utils";

export interface ICTFCore {
  getServerCore(): ServerCore;
  getModuleManager(): ModuleManager;
  getEntityManager(): typeof EntityManager;
  getDatabaseFactory(): typeof DatabaseFactory;
  RPC(): typeof ServerRPC;
  log: {
    info: typeof logInfo;
    error: typeof logError;
    warning: typeof logWarning;
  };
  player: {
    utils: typeof playerUtils;
  };
  getVersion(): string;
  isDebugMode(): boolean;
}

export class CTFCore implements ICTFCore {
  private static instance: CTFCore;
  private serverCore: ServerCore | null = null;
  private moduleManager: ModuleManager;

  private constructor() {
    this.moduleManager = ModuleManager.getInstance();
    ServerRPC.init();
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

  public RPC(): typeof ServerRPC {
    return ServerRPC;
  }

  public log = {
    info: logInfo,
    error: logError,
    warning: logWarning,
  };
  public player = {
    utils: playerUtils,
  };
  public getVersion(): string {
    return GetResourceMetadata(GetCurrentResourceName(), "version", 0);
  }

  public isDebugMode(): boolean {
    return this.serverCore?.isDebugMode() || false;
  }
}

export function getCTF(): ICTFCore {
  return CTFCore.getInstance();
}
