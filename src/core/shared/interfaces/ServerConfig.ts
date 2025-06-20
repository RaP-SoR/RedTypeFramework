import { DbConfig } from "@ctf/shared/interfaces/DBConfig";

export interface ServerConfig {
  debug: boolean;
  debugDatabase?: boolean;
  serverVersion: string;
  database: DbConfig;
}
