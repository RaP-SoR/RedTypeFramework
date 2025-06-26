import { IModule, IModuleInfo } from "../../../src/core/shared/interfaces/IModule";
import { ExampleConfig, ExampleUser, EXAMPLE_EVENTS } from "../shared/index";

export class ExampleComplexModule implements IModule {
  public info: IModuleInfo = {
    name: "example-complex",
    version: "1.0.0",
    description: "Beispiel für ein komplexes Modul mit erweiterter Struktur",
    author: "CTF Framework",
    dependencies: [],
    requiredCoreVersion: "0.0.1"
  };

  private users: Map<string, ExampleUser> = new Map();
  private config: ExampleConfig = {
    enabled: true,
    maxUsers: 100,
    features: ["chat", "commands", "ui"]
  };

  public async onLoad(): Promise<void> {
    console.log(`[${this.info.name}] Server module loaded`);
    this.initializeDatabase();
  }

  public async onStart(): Promise<void> {
    console.log(`[${this.info.name}] Server module started`);
    this.registerEvents();
    this.registerCommands();
  }

  public async onStop(): Promise<void> {
    console.log(`[${this.info.name}] Server module stopping`);
    this.users.clear();
  }

  public async onUnload(): Promise<void> {
    console.log(`[${this.info.name}] Server module unloaded`);
  }

  private initializeDatabase(): void {
    // Database initialization logic
    console.log(`[${this.info.name}] Database initialized`);
  }

  private registerEvents(): void {
    // Player joining
    onNet(EXAMPLE_EVENTS.USER_JOIN, (source: number, userData: Partial<ExampleUser>) => {
      const user: ExampleUser = {
        id: `player_${source}`,
        name: userData.name || `Player ${source}`,
        level: userData.level || 1,
        permissions: userData.permissions || []
      };
      
      this.users.set(user.id, user);
      console.log(`[${this.info.name}] User joined:`, user.name);
      
      // Notify all clients
      emitNet(EXAMPLE_EVENTS.USER_JOIN, -1, user);
    });

    // Player leaving
    onNet(EXAMPLE_EVENTS.USER_LEAVE, (source: number) => {
      const userId = `player_${source}`;
      const user = this.users.get(userId);
      
      if (user) {
        this.users.delete(userId);
        console.log(`[${this.info.name}] User left:`, user.name);
        
        // Notify all clients
        emitNet(EXAMPLE_EVENTS.USER_LEAVE, -1, userId);
      }
    });
  }

  private registerCommands(): void {
    RegisterCommand("example:users", (source: number, args: string[]) => {
      const userList = Array.from(this.users.values());
      console.log(`[${this.info.name}] Current users (${userList.length}):`, userList);
      
      emitNet("chat:addMessage", source, {
        args: [`Users online: ${userList.length}`]
      });
    }, false);

    RegisterCommand("example:config", (source: number, args: string[]) => {
      console.log(`[${this.info.name}] Current config:`, this.config);
      
      emitNet("chat:addMessage", source, {
        args: [`Max users: ${this.config.maxUsers}, Features: ${this.config.features.join(", ")}`]
      });
    }, false);
  }
}

// Export the module
export default new ExampleComplexModule();
