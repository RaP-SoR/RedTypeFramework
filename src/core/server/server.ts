import { ServerCore } from "./server-core";
import { ServerConfig } from "../shared/interfaces/ServerConfig";
import { logError, logInfo } from "../shared/logs";
//import './speedcam/cmds'

const serverConfig: ServerConfig = {
  debug: GetConvar("ctf:debug", "false") === "true",
  serverVersion: GetResourceMetadata(GetCurrentResourceName(), "version", 0),
  database: {
    provider: "cfxmongodb",
    host: GetConvar("ctf:db_host", "localhost"),
    port: parseInt(GetConvar("ctf:db_port", "27017")),
    database: GetConvar("ctf:db_name", "fivem_dev"),
    username: GetConvar("ctf:db_user", ""),
    password: GetConvar("ctf:db_pass", ""),
  },
};

const server = new ServerCore(serverConfig);

if (serverConfig.database.provider === "cfxmongodb") {
  onNet("cfx-mongodb:connected", () => {
    logInfo("Ressource gestartet by Cfx-MongoDB, initialisiere Server...");
    server
      .start()
      .then(() => {
        logInfo("CFXType Framework Server erfolgreich gestartet");
      })
      .catch((err) =>
        logError("Fehler beim Starten des CFXType Framework Servers", err)
      );
  });
} else {
  on("onResourceStart", (resourceName: string) => {
    if (resourceName === GetCurrentResourceName()) {
      logInfo("Ressource gestartet, initialisiere Server...");
      server
        .start()
        .then(() => {
          logInfo("CFXType Framework Server erfolgreich gestartet");
        })
        .catch((err) =>
          logError("Fehler beim Starten des CFXType Framework Servers", err)
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
        logInfo("CFXType Framework Server erfolgreich heruntergefahren")
      )
      .catch((err) =>
        logError(
          "Fehler beim Herunterfahren des CFXType Framework Servers",
          err
        )
      );
  }
});

exports("ctf:getServer", () => server);

