import { ServerConfig } from "@ctf/shared/interfaces/ServerConfig";
import { ServerCore } from "./server-core";
import { logInfo, logError } from "@ctf/shared/logs";
import { IBaseModel } from "../shared/interfaces/IBaseModel";

const serverConfig: ServerConfig = {
  debug: GetConvar("ctf:debug", "false") === "true",
  serverVersion: GetResourceMetadata(GetCurrentResourceName(), "version", 0),
  database: {
    provider: "cfxmongodb",
    host: GetConvar("ctf:db_host", "192.168.178.209"),
    port: parseInt(GetConvar("rtf:db_port", "27017")),
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

/// Test Code
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

  /*
  if (!userExist) {
    console.log("Benutzer nicht gefunden, erstelle neuen Benutzer...");
    const user = await db.getRepository<User>("users").insert({
      username: "testuser1",
      password: "testpassword",
      email: "",
      sort: "test",
    });
    console.log("Neuer Benutzer erstellt:", JSON.stringify(user));
  } else {
    console.log("Benutzer gefunden, ID:", userExist.id);
    console.log("Aktualisiere Benutzer...");

    // Alternativ direkt nach Benutzernamen statt ID aktualisieren
    const updateUser = await db
      .getRepository<User>("users")
      .update(userExist.id, {
        password: "newpassword" + Math.random().toString(36).substring(7),
        email: "mail_" + new Date().toISOString(),
      });

    if (updateUser) {
      logInfo("Benutzer aktualisiert: " + JSON.stringify(updateUser));
    } else {
      logError("Fehler beim Aktualisieren des Benutzers");
    }
  }*/

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
