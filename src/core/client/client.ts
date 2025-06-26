import "./entityManager/entityManager";
//import "./speedcam/speedcam" 
import { SpawnManager } from './SpawnManager';
import { ClientModuleManager } from './ClientModuleManager';
import { logInfo } from '@shared/logs';

SpawnManager.getInstance();

// Initialize client module system
const clientModuleManager = ClientModuleManager.getInstance();
logInfo("CTF Client initialized with module system");

