import { SpawnManager } from "@/core/client/SpawnManager";
import { CVector3 } from "@/core/shared/CVector3";
import { IEntity } from "@/core/shared/interfaces/IEntity";
import { EntityManager } from "../entity/entityManager";


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

RegisterCommand('respawn', () => {
    SpawnManager.getInstance().requestRespawn();
}, false);