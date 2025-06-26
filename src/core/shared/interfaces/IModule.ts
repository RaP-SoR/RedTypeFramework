export interface IModuleInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  requiredCoreVersion?: string;
}

export interface IModuleLifecycle {
  onLoad?(): Promise<void> | void;
  onStart?(): Promise<void> | void;
  onStop?(): Promise<void> | void;
  onUnload?(): Promise<void> | void;
}

export interface IModule extends IModuleLifecycle {
  info: IModuleInfo;
}

export interface IModuleManager {
  loadModule(modulePath: string): Promise<boolean>;
  unloadModule(moduleName: string): Promise<boolean>;
  getLoadedModules(): IModuleInfo[];
  isModuleLoaded(moduleName: string): boolean;
  getModule(moduleName: string): IModule | undefined;
}
