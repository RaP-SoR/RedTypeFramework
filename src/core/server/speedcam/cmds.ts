import { CVector3 } from "@/core/shared/CVector3";
import { IEntity, IEntityObjectData } from "@/core/shared/interfaces/IEntity";
import { EntityManager } from "../entity/entityManager";

let createtSpeedcam: boolean = false;
let speedcam: IEntity;
RegisterCommand(
  "scam",
  (source: any, args: any, rawCommand: string) => {
    const playerPed = GetPlayerPed(source);
    const pos = GetEntityCoords(playerPed, true);
    const rot = GetEntityRotation(playerPed, 2);
    const heading = GetEntityHeading(playerPed);
    
    // Berechne Position vor dem Spieler (2 Meter nach vorne)
    const distance = 2.0;
    const headingRad = (heading * Math.PI) / 180;
    const spawnX = pos[0] + Math.cos(headingRad) * distance;
    const spawnY = pos[1] + Math.sin(headingRad) * distance;
    
    const data : IEntityObjectData = {
        model: "prop_tv_cam_02",
        isNetwork: true,
        collision: true,
        dynamic: false,
        alpha: 255,
        };
    speedcam = {
      id: `speedcam`,
      name: "Test Camp",
      pos: new CVector3(spawnX, spawnY, pos[2] - 1.25),
      rot: new CVector3(rot[0], rot[1], rot[2] + 180),
      type: "object",
      streamDistance: 100.0,
      scale: 1.0,
      data: data
    };
    createtSpeedcam = true;
    EntityManager.add(speedcam);
    emitNet("speedcam:create", -1, speedcam);
  },
  false
);
RegisterCommand(
    "delscam",
    (source: any, args: any, rawCommand: string) => {
      EntityManager.remove("speedcam");
        createtSpeedcam = false;
        emitNet("speedcam:delete", -1, speedcam);
    },false
);