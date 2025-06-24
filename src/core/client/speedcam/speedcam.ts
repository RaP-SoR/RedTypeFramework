import { CVector3 } from "../../shared/CVector3";
import { IEntity } from "../../shared/interfaces/IEntity";
import { ClientEntityManager } from "../entityManager/entityManager";
import { drawSpeedcamZoneAdvanced, drawSpeedcamZoneGrid, isInSpeedcamZone } from "./drawZone";

let _speedcam: IEntity | null = null;
let _drawTick: number | null = null; // Variable für den Tick-Handler
let _testTick: number | null = null; // Für den Kegel-Test 
export interface SpeedcamZoneConfig {
  leftAngleDegrees: number;  // Winkel nach links (z.B. 35)
  rightAngleDegrees: number; // Winkel nach rechts (z.B. 35)
  maxDistance: number;       // Maximale Entfernung (z.B. 30)
  rotationOffset?: number;   // Offset für die Rotation in Grad (z.B. 90, 180, -90)
  positionOffset?: number; // Offset für die Position in Metern (z.B. 1m nach vorne)
}
onNet("speedcam:create", (speedcam: IEntity) => {
  if (_speedcam) {
    ClientEntityManager.remove("speedcam");
  
    if (_drawTick !== null) {
      clearTick(_drawTick);
      _drawTick = null;
    }

    if (_testTick !== null) {
      clearTick(_testTick);
      _testTick = null;
    }
  }

  _speedcam = speedcam;

  if (_drawTick === null) {
    _drawTick = setTick(() => {
      if (!_speedcam) return;
      const speedcamPos = _speedcam.pos;
      const speedcamRotation = _speedcam.rot;
      if (!speedcamPos || !speedcamRotation) return;
      
      const position = new CVector3(speedcamPos.x, speedcamPos.y, speedcamPos.z + 1.0);
      const rotation = new CVector3(speedcamRotation.x ?? 0, speedcamRotation.y ?? 0, speedcamRotation.z ?? 0);
      const zoneConfig: SpeedcamZoneConfig = {
        leftAngleDegrees: 25,
        rightAngleDegrees: 25,
        maxDistance: 40,
        positionOffset: 0.0, 
        rotationOffset: -90
      };
    
      drawSpeedcamZoneAdvanced(position, rotation, zoneConfig);
      drawSpeedcamZoneGrid(position, rotation, zoneConfig);
    });
  }

  if (_testTick === null) {
    let lastPlayerPosition: CVector3 | null = null;
    
    _testTick = setTick(() => {
      if (!_speedcam) return;
      
      const speedcamPos = _speedcam.pos;
      const speedcamRotation = _speedcam.rot;
      if (!speedcamPos || !speedcamRotation) return;
  
      const playerPed = PlayerPedId();
      const playerPos = GetEntityCoords(playerPed, false);
      const playerPosition = new CVector3(playerPos[0], playerPos[1], playerPos[2]);
  
      const position = new CVector3(speedcamPos.x, speedcamPos.y, speedcamPos.z + 1.0);
      const rotation = new CVector3(speedcamRotation.x ?? 0, speedcamRotation.y ?? 0, speedcamRotation.z ?? 0);
      const zoneConfig: SpeedcamZoneConfig = {
        leftAngleDegrees: 25,
        rightAngleDegrees: 25,
        maxDistance: 40,
        positionOffset: 0.0,
        rotationOffset: -90
      };
  
      const isInZone = isInSpeedcamZone(position, rotation, playerPosition, zoneConfig);
      
      const distance = position.distanceTo(playerPosition);
  
      let isApproaching = false;
      let movementDirection = "Unbekannt";
      let speedTowards = 0;
  
      if (lastPlayerPosition) {
        const lastDistance = position.distanceTo(lastPlayerPosition);
        
        if (Math.abs(distance - lastDistance) > 0.01) { // Mindestbewegung
          isApproaching = distance < lastDistance;
          movementDirection = isApproaching ? "Nähert sich" : "Entfernt sich";
          
          const deltaTime = 1/60; 
          speedTowards = Math.abs(distance - lastDistance) / deltaTime;
        }
      }
  
      lastPlayerPosition = new CVector3(playerPosition.x, playerPosition.y, playerPosition.z);
  
      const shouldTrigger = isInZone && isApproaching;
      // Zeige Debug-Informationen auf dem Bildschirm
      const screenY = 0.05;
      SetTextFont(0);
      SetTextProportional(true);
      SetTextScale(0.35, 0.35);
      SetTextColour(255, 255, 255, 255);
      SetTextDropShadow();
      SetTextEdge(1, 0, 0, 0, 255);
      SetTextEntry("STRING");
  
      // Status anzeigen
      if (shouldTrigger) {
        SetTextColour(255, 0, 0, 255); // Rot wenn Speedcam auslösen würde
        AddTextComponentString(`🚨 SPEEDCAM WÜRDE BLITZEN! 🚨`);
      } else if (isInZone && !isApproaching) {
        SetTextColour(255, 165, 0, 255); // Orange wenn im Kegel aber entfernt sich
        AddTextComponentString(`⚠️ Im Kegel, aber entfernt sich`);
      } else if (isInZone) {
        SetTextColour(255, 255, 0, 255); // Gelb wenn im Kegel aber keine Bewegung
        AddTextComponentString(`⚠️ Im Kegel, keine Bewegung`);
      } else {
        SetTextColour(0, 255, 0, 255); // Grün wenn außerhalb
        AddTextComponentString(`✅ Außerhalb des Kegels`);
      }
      DrawText(0.02, screenY);
  
      // Zusätzliche Informationen
      SetTextColour(255, 255, 255, 255);
      AddTextComponentString(`Entfernung: ${distance.toFixed(2)}m`);
      DrawText(0.02, screenY + 0.03);
  
      AddTextComponentString(`Bewegung: ${movementDirection}`);
      DrawText(0.02, screenY + 0.06);
  
      if (speedTowards > 0.1) {
        AddTextComponentString(`Geschw. Richtung Speedcam: ${(speedTowards * 3.6).toFixed(1)} km/h`);
        DrawText(0.02, screenY + 0.09);
      }
  
      AddTextComponentString(`Spieler: X:${playerPosition.x.toFixed(1)} Y:${playerPosition.y.toFixed(1)} Z:${playerPosition.z.toFixed(1)}`);
      DrawText(0.02, screenY + 0.12);
  
      AddTextComponentString(`Speedcam: X:${position.x.toFixed(1)} Y:${position.y.toFixed(1)} Z:${position.z.toFixed(1)}`);
      DrawText(0.02, screenY + 0.15);
  
      AddTextComponentString(`Rotation: ${rotation.z.toFixed(1)}° (Offset: ${zoneConfig.rotationOffset}°)`);
      DrawText(0.02, screenY + 0.18);
  
      // Zeige einen Punkt auf der Spieler-Position mit verschiedenen Farben
      if (shouldTrigger) {
        // Rot blinkend wenn Speedcam auslösen würde
        const alpha = Math.sin(GetGameTimer() * 0.01) > 0 ? 255 : 100;
        DrawMarker(1, playerPosition.x, playerPosition.y, playerPosition.z - 1.0, 
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
                  2.0, 2.0, 1.0, 
                  255, 0, 0, alpha, false, true, 2, false, "", "", false);
      } else if (isInZone && !isApproaching) {
        // Orange wenn im Kegel aber entfernt sich
        DrawMarker(1, playerPosition.x, playerPosition.y, playerPosition.z - 1.0, 
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
                  2.0, 2.0, 1.0, 
                  255, 165, 0, 200, false, true, 2, false, "", "", false);
      } else if (isInZone) {
        // Gelb wenn im Kegel aber keine klare Bewegung
        DrawMarker(1, playerPosition.x, playerPosition.y, playerPosition.z - 1.0, 
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
                  2.0, 2.0, 1.0, 
                  255, 255, 0, 200, false, true, 2, false, "", "", false);
      } else {
        // Grüner Punkt wenn außerhalb
        DrawMarker(1, playerPosition.x, playerPosition.y, playerPosition.z - 1.0, 
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
                  2.0, 2.0, 1.0, 
                  0, 255, 0, 200, false, true, 2, false, "", "", false);
      }
    });
  }
});

onNet("speedcam:delete", () => {
  _speedcam = null;
  ClientEntityManager.remove("speedcam");
  
  // Stoppe das Zeichnen der Zone
  if (_drawTick !== null) {
    clearTick(_drawTick);
    _drawTick = null;
  }

  // Stoppe den Test-Tick
  if (_testTick !== null) {
    clearTick(_testTick);
    _testTick = null;
  }
});

