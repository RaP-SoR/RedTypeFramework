import { IModule, IModuleInfo, IModuleManager } from "@shared/interfaces/IModule";
import { logInfo, logError, logWarning } from "@shared/logs";

export class ClientModuleManager implements IModuleManager {
  private static instance: ClientModuleManager;
  private loadedModules: Map<string, IModule> = new Map();

  private constructor() {
    logInfo("ClientModuleManager initialized");
  }

  public static getInstance(): ClientModuleManager {
    if (!ClientModuleManager.instance) {
      ClientModuleManager.instance = new ClientModuleManager();
    }
    return ClientModuleManager.instance;
  }

  public async loadModule(modulePath: string): Promise<boolean> {
    try {
      logInfo(`Loading client module from: ${modulePath}`);
      
      const moduleExport = await import(modulePath);
      const module: IModule = moduleExport.default || moduleExport;

      if (!module.info || !module.info.name) {
        logError(`Invalid client module at ${modulePath}: Missing module info`);
        return false;
      }

      if (this.isModuleLoaded(module.info.name)) {
        logWarning(`Client module ${module.info.name} is already loaded`);
        return false;
      }

      if (module.onLoad) {
        await module.onLoad();
      }

      this.loadedModules.set(module.info.name, module);
      logInfo(`Client module ${module.info.name} v${module.info.version} loaded successfully`);

      if (module.onStart) {
        await module.onStart();
        logInfo(`Client module ${module.info.name} started successfully`);
      }

      return true;
    } catch (error) {
      logError(`Failed to load client module from ${modulePath}:`, error);
      return false;
    }
  }

  public async unloadModule(moduleName: string): Promise<boolean> {
    try {
      const module = this.loadedModules.get(moduleName);
      if (!module) {
        logWarning(`Client module ${moduleName} is not loaded`);
        return false;
      }

      if (module.onStop) {
        await module.onStop();
      }

      if (module.onUnload) {
        await module.onUnload();
      }

      this.loadedModules.delete(moduleName);
      logInfo(`Client module ${moduleName} unloaded successfully`);
      return true;
    } catch (error) {
      logError(`Failed to unload client module ${moduleName}:`, error);
      return false;
    }
  }

  public getLoadedModules(): IModuleInfo[] {
    return Array.from(this.loadedModules.values()).map(module => module.info);
  }

  public isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  public getModule(moduleName: string): IModule | undefined {
    return this.loadedModules.get(moduleName);
  }

  public async shutdownAllModules(): Promise<void> {
    logInfo("Shutting down all client modules...");
    
    const moduleNames = Array.from(this.loadedModules.keys());
    for (const moduleName of moduleNames) {
      await this.unloadModule(moduleName);
    }
    
    logInfo("All client modules shut down");
  }
}
