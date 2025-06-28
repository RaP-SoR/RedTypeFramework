import { logError, logInfo } from "@shared/logs";
import { ServerCore } from "../server-core";
import { ServerRPC } from "../RPC";

export function sendMessage(source: number, message: string): void {
  if (typeof source !== "number" || typeof message !== "string") {
    throw new Error("Invalid parameters for sendMessage");
  }

  if (!ServerCore.hasInstance()) {
    logError("ServerCore not initialized yet, cannot send message");
    return;
  }

  const eventName = ServerCore.getInstance().getConfig().chatEvent;
  logInfo(`eventName: ${eventName}`);
  if (!eventName) {
    logError("Chat event is not configured in server settings");
    return;
  }
  emitNet(eventName, source, {
    args: [message],
  });
}

/**
 * Get the street name and crossing for a given player.
 * @param source The source player ID to get the street name for.
 * @description Returns the street name and crossing for a given player.
 * @returns [string, string] An array containing the street name and crossing.
 */
export async function getStreetName(source: number): Promise<string[]> {
  const playerPed = GetPlayerPed(source);
  if (playerPed === 0) {
    throw new Error("Player not found");
  }
  const coords = GetEntityCoords(playerPed);
  const street: number[] = await ServerRPC.call(
    source,
    "GetStreetNameAtCoord",
    [coords[0], coords[1], coords[2]]
  );
  if (!street || street.length < 1) {
    throw new Error("Invalid street name received from client");
  }

  const name: string = await ServerRPC.call(
    source,
    "GetStreetNameFromHashKey",
    [street[0]]
  );
  const crossing: string = await ServerRPC.call(
    source,
    "GetStreetNameFromHashKey",
    [street[1]]
  );
  return [name, crossing];
}
