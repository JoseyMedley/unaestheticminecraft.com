import { system } from "./example_and_test/bedrockapi-system";
import { command, bedrockServer } from "bdsx";

var Radius = 872;
var Multiplier = [1,-1];
//change radius to modify the spawn radius

console.log("SystemUpdateFunction loaded");
system.executeCommand("/gamerule showcoordinates true", () => {});
//var counter = 0;
system.update = function () {

    // changes spawn location to random point within the specified radius
    var xmultiplier= Math.round(Math.random());
    var zmultiplier= Math.round(Math.random());
    var newSpawnPointX= Math.floor(Math.random()*Radius)*Multiplier[xmultiplier];
    var newSpawnPointZ= Math.floor(Math.random()*Radius)*Multiplier[zmultiplier];
    var SpawnCommand="/setWorldSpawn ";
    SpawnCommand= SpawnCommand + String(newSpawnPointX) + " 64 " + String(newSpawnPointZ);
    system.executeCommand(SpawnCommand, () => {});
    system.executeCommand("/gamerule spawnRadius 128", () => {});

    // remove simple illegals from player inventories and kill illegal entities
    system.executeCommand("/kill @e[type=npc]", () => {});
    system.executeCommand("/kill @e[type=command_block_minecart]", () => {});
    system.executeCommand("/clear @a[tag=!admin] barriers", () => {});
    system.executeCommand("/clear @a[tag=!admin] bedrock", () => {});
    system.executeCommand("/clear @a[tag=!admin] end_portal_frame", () => {});
    system.executeCommand("/clear @a[tag=!admin] deny", () => {});
    system.executeCommand("/clear @a[tag=!admin] allow", () => {});
    system.executeCommand("/clear @a[tag=!admin] spawn_egg", () => {});
    system.executeCommand("/clear @a[tag=!admin] mob_spawner", () => {});
    system.executeCommand("/clear @a[tag=!admin] jigsaw", () => {});

    //patch GMC
    system.executeCommand("/gamemode s @a[tag=!admin]", () => {});
    
    //doop
    /*
    counter = counter + 1;
    if (counter >= 20){
        system.executeCommand("/clone 0 -60 0 0 -60 0 0 -60 1", () => {});
        counter = 0;
    }
    */
};
