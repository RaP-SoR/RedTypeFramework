import { ServerCore } from "./server-core";
import { EntityManager } from "./entity/entityManager";
import { ServerConfig } from "../shared/interfaces/ServerConfig";
import { logError, logInfo } from "../shared/logs";
import { IEntity } from "../shared/interfaces/IEntity";
import { CVector3 } from "../shared/CVector3";

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

// Test Code komplett deaktiviert wegen "Awaiting Scripts" Problem
/*
const timer = setTimeout(() => {
  test();
}, 5000);

interface User extends IBaseModel {
  username: string;
  password: string;
  email: string;
  sort: string;
}

async function test() {
  

  const db = server.getDatabaseProvider();

  console.log("Suche nach Benutzer 'testuser'...");
  const userExist = await db
    .getRepository<User>("users")
    .findOne({ username: "testuser" });

  const count = await db
    .getRepository<User>("users")
    .count({ username: "%test%" });
  logInfo("Anzahl der Benutzer : " + count);
  if (!userExist) {
    logInfo("Benutzer existiert nicht, lösche Benutzer...");
  }
  const deleteUser = await db
    .getRepository<User>("users")
    .delete("682934ac5e5d5bb28744cb6a");
  if (deleteUser) {
    logInfo("Benutzer gelöscht");
  }
}
*/


RegisterCommand(
  "tblip",
  (source: any, args: any, rawCommand: string) => {
    const playerPed = GetPlayerPed(source);
    const pos = GetEntityCoords(playerPed, true);
    const randomID = Math.floor(Math.random() * 1000000);
    const blip: IEntity = {
      id: `blip_${randomID}`,
      name: "Test Blip",
      pos: new CVector3(pos[0], pos[1], pos[2]),
      type: "blip",
      streamDistance: 8.0,
      dimension: 0,
      scale: 1.0,
      data: {
        sprite: 1,
        color: 2,
        alpha: 255,
        shortRange: true,
        crew: false,
        blipId: 12345,
        display: 2,
      },
    };

    EntityManager.add(blip);
  },
  false
);
