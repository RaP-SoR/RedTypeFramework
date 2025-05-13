import { IDatabaseProvider } from "@rtf/shared/interfaces/IDatabaseProvider";
import { DBProviders, DbConfig } from "@rtf/shared/interfaces/DBConfig";
import { IBaseModel } from "@/core/shared/interfaces/IBaseModel";

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
