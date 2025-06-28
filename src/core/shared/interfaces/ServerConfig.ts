import { DbConfig } from "./DBConfig";

export interface ServerConfig {
  debug: boolean;
  debugDatabase?: boolean;
  serverVersion: string;
  database: DbConfig;
  chatEvent: string; // Default: "chat:addMessage"
}
