
import { IDatabaseProvider } from "@rtf/shared/interfaces/IDatabaseProvider";
import { DBProviders ,DbConfig } from "@rtf/shared/interfaces/DBConfig";

import { CFXMongoDBProvider } from "./providers/CFXMongoDBProvider";

export class DatabaseFactory {

  public static createProvider(provider: DBProviders, config: DbConfig): IDatabaseProvider {
    switch (provider) {
      case "mongodb":
        return new CFXMongoDBProvider('mongodb', '');
      default:
        throw new Error(`Unknown database type: ${provider}`);
    }
  }
}




