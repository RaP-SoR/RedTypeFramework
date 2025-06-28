import "./entityManager/entityManager";
//import "./speedcam/speedcam"
import { SpawnManager } from "./SpawnManager";
import { ClientModuleManager } from "./ClientModuleManager";
import { logInfo } from "@shared/logs";
import { ClientRPC } from "./RPC";

SpawnManager.getInstance();
ClientRPC.init();

const clientModuleManager = ClientModuleManager.getInstance();
logInfo("CTF Client initialized with module system");
