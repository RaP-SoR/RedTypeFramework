import { EXAMPLE_EVENTS, ExampleUser } from "../shared/index";

class ExampleComplexClient {
  private users: Map<string, ExampleUser> = new Map();

  public init(): void {
    console.log("[template] Client module initialized");
    this.registerEvents();
    this.registerCommands();
  }

  private registerEvents(): void {
    // Listen for user join events
    onNet(EXAMPLE_EVENTS.USER_JOIN, (user: ExampleUser) => {
      this.users.set(user.id, user);
      console.log("[template] User joined:", user.name);
      
      // Show notification
      this.showNotification(`${user.name} joined the server`, "success");
    });

    // Listen for user leave events
    onNet(EXAMPLE_EVENTS.USER_LEAVE, (userId: string) => {
      const user = this.users.get(userId);
      if (user) {
        this.users.delete(userId);
        console.log("[template] User left:", user.name);
        
        // Show notification
        this.showNotification(`${user.name} left the server`, "info");
      }
    });

    // Listen for config updates
    onNet(EXAMPLE_EVENTS.CONFIG_UPDATE, (config: any) => {
      console.log("[template] Config updated:", config);
    });
  }

  private registerCommands(): void {
    RegisterCommand("example:list", () => {
      const userList = Array.from(this.users.values());
      console.log("[template] Users:", userList);
      
      userList.forEach((user, index) => {
        setTimeout(() => {
          this.showNotification(`${user.name} (Level ${user.level})`, "info");
        }, index * 1000);
      });
    }, false);

    RegisterCommand("example:ui", () => {
      console.log("[template] Opening UI...");
      // Trigger UI opening (this would integrate with the CTF UI system)
      SendNUIMessage({
        type: "showUI",
        component: "example-complex",
        data: {
          users: Array.from(this.users.values())
        }
      });
    }, false);
  }

  private showNotification(message: string, type: "success" | "error" | "info" = "info"): void {
    // This would integrate with the framework's notification system
    console.log(`[template] ${type.toUpperCase()}: ${message}`);
    
    // Example FiveM notification
    SetNotificationTextEntry("STRING");
    AddTextComponentString(message);
    DrawNotification(false, false);
  }

  public getUsers(): ExampleUser[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): ExampleUser | undefined {
    return this.users.get(id);
  }
}

// Initialize the client module
const exampleComplexClient = new ExampleComplexClient();
exampleComplexClient.init();

export default exampleComplexClient;
