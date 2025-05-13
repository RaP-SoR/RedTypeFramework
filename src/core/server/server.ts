import { ServerConfig } from "@rtf/shared/interfaces/ServerConfig";
import { ServerCore } from "./server-core";
import { logInfo, logError } from "@rtf/shared/logs";

const serverConfig: ServerConfig = {
  debug: GetConvar("rtf:debug", "false") === "true",
  serverVersion: GetResourceMetadata(GetCurrentResourceName(), "version", 0),
  database: {
    provider: "cfxmongodb",
    host: GetConvar("rtf:db_host", "localhost"),
    port: parseInt(GetConvar("rtf:db_port", "27017")),
    database: GetConvar("rtf:db_name", "redtype-framework"),
    username: GetConvar("rtf:db_user", ""),
    password: GetConvar("rtf:db_pass", ""),
  },
};

const server = new ServerCore(serverConfig);

if (serverConfig.database.provider === "cfxmongodb") {
  on("cfx-mongodb:connected", () => {
    logInfo("Ressource gestartet by Cfx-MongoDB, initialisiere Server...");
    server
      .start()
      .then(() => logInfo("RedType Framework Server erfolgreich gestartet"))
      .catch((err) =>
        logError("Fehler beim Starten des RedType Framework Servers", err)
      );
  });
} else {
  on("onResourceStart", (resourceName: string) => {
    if (resourceName === GetCurrentResourceName()) {
      logInfo("Ressource gestartet, initialisiere Server...");
      server
        .start()
        .then(() => logInfo("RedType Framework Server erfolgreich gestartet"))
        .catch((err) =>
          logError("Fehler beim Starten des RedType Framework Servers", err)
        );
    }
  });
}
on("onResourceStop", (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    logInfo("Ressource wird gestoppt, fahre Server herunter...");
    server
      .stop()
      .then(() =>
        logInfo("RedType Framework Server erfolgreich heruntergefahren")
      )
      .catch((err) =>
        logError(
          "Fehler beim Herunterfahren des RedType Framework Servers",
          err
        )
      );
  }
});

exports("rtf:getServerInstance", () => server);
