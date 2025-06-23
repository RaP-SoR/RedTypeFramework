import { IDatabaseProvider } from "@shared/interfaces/IDatabaseProvider";
import { DBProviders, DbConfig } from "@shared/interfaces/DBConfig";
import { IBaseModel } from "@shared/interfaces/IBaseModel";

import { CFXMongoDBProvider } from "./providers/CFXMongoDBProvider";

export class DatabaseFactory {
  public static createProvider(
    provider: DBProviders,
    config: DbConfig
  ): IDatabaseProvider {
    switch (provider) {
      case "cfxmongodb":
        return new CFXMongoDBProvider<IBaseModel>("cfxmongodb");
      default:
        throw new Error(`Unknown database type: ${provider}`);
    }
  }
}
