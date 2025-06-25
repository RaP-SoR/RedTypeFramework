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