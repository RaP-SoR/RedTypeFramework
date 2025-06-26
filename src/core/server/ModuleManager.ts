import { IModule, IModuleInfo, IModuleManager } from "@shared/interfaces/IModule";
import { logInfo, logError, logWarning } from "@shared/logs";

export class ModuleManager implements IModuleManager {
  private static instance: ModuleManager;
  private loadedModules: Map<string, IModule> = new Map();
  private coreVersion: string;

  private constructor() {
    this.coreVersion = GetResourceMetadata(GetCurrentResourceName(), "version", 0);
    logInfo("ModuleManager initialized");
  }

  public static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  public async loadModule(modulePath: string): Promise<boolean> {
    try {
      logInfo(`Loading module from: ${modulePath}`);
      
      // Dynamically import the module
      const moduleExport = await import(modulePath);
      const module: IModule = moduleExport.default || moduleExport;

      if (!module.info || !module.info.name) {
        logError(`Invalid module at ${modulePath}: Missing module info`);
        return false;
      }

      // Check if module is already loaded
      if (this.isModuleLoaded(module.info.name)) {
        logWarning(`Module ${module.info.name} is already loaded`);
        return false;
      }

      // Check core version compatibility
      if (module.info.requiredCoreVersion && !this.isVersionCompatible(module.info.requiredCoreVersion)) {
        logError(`Module ${module.info.name} requires core version ${module.info.requiredCoreVersion}, but current version is ${this.coreVersion}`);
        return false;
      }

      // Check dependencies
      if (module.info.dependencies) {
        for (const dependency of module.info.dependencies) {
          if (!this.isModuleLoaded(dependency)) {
            logError(`Module ${module.info.name} requires dependency ${dependency} which is not loaded`);
            return false;
          }
        }
      }

      // Load the module
      if (module.onLoad) {
        await module.onLoad();
      }

      this.loadedModules.set(module.info.name, module);
      logInfo(`Module ${module.info.name} v${module.info.version} loaded successfully`);

      // Start the module
      if (module.onStart) {
        await module.onStart();
        logInfo(`Module ${module.info.name} started successfully`);
      }

      return true;
    } catch (error) {
      logError(`Failed to load module from ${modulePath}:`, error);
      return false;
    }
  }

  public async unloadModule(moduleName: string): Promise<boolean> {
    try {
      const module = this.loadedModules.get(moduleName);
      if (!module) {
        logWarning(`Module ${moduleName} is not loaded`);
        return false;
      }

      // Stop the module
      if (module.onStop) {
        await module.onStop();
      }

      // Unload the module
      if (module.onUnload) {
        await module.onUnload();
      }

      this.loadedModules.delete(moduleName);
      logInfo(`Module ${moduleName} unloaded successfully`);
      return true;
    } catch (error) {
      logError(`Failed to unload module ${moduleName}:`, error);
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

  private isVersionCompatible(requiredVersion: string): boolean {
    // Simple version check - you can implement semantic versioning here
    return this.coreVersion >= requiredVersion;
  }

  public async loadModulesFromDirectory(moduleDirectory: string): Promise<void> {
    logInfo(`Loading modules from directory: ${moduleDirectory}`);
    
    // In a real implementation, you would scan the directory for modules
    // For now, this is a placeholder that would need CFX-specific file system access
    logWarning("Directory scanning not implemented - modules must be loaded manually");
  }

  public async shutdownAllModules(): Promise<void> {
    logInfo("Shutting down all modules...");
    
    const moduleNames = Array.from(this.loadedModules.keys());
    for (const moduleName of moduleNames) {
      await this.unloadModule(moduleName);
    }
    
    logInfo("All modules shut down");
  }
}
