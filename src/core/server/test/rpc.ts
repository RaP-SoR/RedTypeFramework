import { getStreetName, sendMessage } from "../player/utils";

RegisterCommand(
  "streetname",
  async (source: number) => {
    try {
      const streetName: string[] = await getStreetName(source);
      sendMessage(
        source,
        `Street for player ${source}: ${streetName[0]} (${streetName[1]})`
      );
    } catch (error) {
      console.error("Error getting street name:", error);
    }
  },
  false
);
