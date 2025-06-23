import { CVector3 } from "@shared/CVector3";
import { IEntity } from "@shared/interfaces/IEntity";

let createdBlips: Array<IEntity> = [];
let blips: Map<string, IEntity> = new Map();
export class EntityBlip {
  static create(entity: IEntity): number {
    const blip = AddBlipForCoord(entity.pos.x, entity.pos.y, entity.pos.z);
    blips.set(entity.id, entity);
    SetBlipSprite(blip, entity.data?.sprite);
    SetBlipScale(blip, entity.scale || 1.0);
    SetBlipAsShortRange(blip, entity.data?.shortRange || true);
    SetBlipColour(blip, entity.data?.color);
    SetBlipAlpha(blip, entity.data?.alpha || 255);
    SetBlipCrew(blip, entity.data?.crew || false);
    SetBlipDisplay(blip, entity.data?.display || 2);
    return blip;
  }

  static delete(id: string) {
    const blip = createdBlips.find((b) => b.id === id);
    if (blip) {
      const blipIndex = createdBlips.indexOf(blip);
      if (blipIndex > -1) {
        createdBlips.splice(blipIndex, 1);
        RemoveBlip(blip.data?.blipId);
      }
    }
  }
  static remove(id: string) {
    const blip = blips.get(id);
    if (blip) {
      RemoveBlip(blip.data?.blipId);
      blips.delete(id);
    }
  }

  static update(id: string) {
    const blip = createdBlips.find((b) => b.id === id);
    if (blip) {
      const blipId = blip.data?.blipId;
      if (blipId) {
        SetBlipSprite(blipId, blip.data?.sprite);
        SetBlipScale(blipId, blip.scale || 1.0);
        SetBlipAsShortRange(blipId, blip.data?.shortRange || true);
        SetBlipColour(blipId, blip.data?.color);
        SetBlipAlpha(blipId, blip.data?.alpha || 255);
        SetBlipCrew(blipId, blip.data?.crew || false);
        SetBlipDisplay(blipId, blip.data?.display || 2);
      }
    }
  }
}
setInterval(async () => {
  const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
  createdBlips.forEach((blip) => {
    if (blip.pos.distanceTo(new CVector3(x, y, z)) > blip.streamDistance) {
      EntityBlip.delete(blip.id);
    }
  });
  blips.forEach((blip) => {
    if (blip.pos.distanceTo(new CVector3(x, y, z)) <= blip.streamDistance) {
      EntityBlip.create(blip);
    }
  });
}, 1000);
