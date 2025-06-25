import { CVector3 } from "../CVector3";

export interface SpawnData {
    pos: CVector3
    heading: number;
    dimension: number;
    type: SpawnType;
    camBehind: boolean;
    data?: Record<string, any>;
}

export enum SpawnType {
    HOUSE = 'house',
    FACTION = 'faction',
    LAST_POSITION = 'last_position',
    NOOB = 'noob',
    NEWPLAYER = 'newplayer',
    DEFAULT = 'default'
}