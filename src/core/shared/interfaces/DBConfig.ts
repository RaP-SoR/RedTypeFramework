export type DBProviders = "cfxmongodb";

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  provider: DBProviders;
  username?: string;
  password?: string;
  options?: Record<string, any>;
}
