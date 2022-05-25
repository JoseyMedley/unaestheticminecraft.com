/* eslint-disable no-restricted-imports */
// General utilities for unaestheticminecraft.com
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { command } from "./bdsx/command";
import { TextPacket } from "bdsx/bds/packets";
import { DeviceOS } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { CommandResultType } from "bdsx/commandresult";


console.log("initializing Utilities");
var Radius = 500;
var Multiplier = [1,-1];
bedrockServer.executeCommand("/gamerule showcoordinates true", true);
command.register("suicide", "respawns yourself").overload((param, origin, output) =>{
    var playername = origin.getName();
    var newcommand = "/kill " + playername;
    bedrockServer.executeCommand(newcommand, true);
}, {});


// logs chat
events.packetAfter(MinecraftPacketIds.Text).on(ev=>{
    console.log(ev.name + ": " + ev.message);
});

events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const connreq = ptr.connreq;
    if (connreq === null) return; // wrong client
    const cert = connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();

    // sendLog
    console.log(`Connection: ${username}> IP=${ip}, XUID=${xuid}, OS=${DeviceOS[connreq.getDeviceOS()] || 'UNKNOWN'}`);

    // sendPacket
    setTimeout(()=>{
        const textPacket = TextPacket.create();
        textPacket.message = "Welcome to unaestheticminecraft.com. Use /suicide to respawn. Most god hacks don't work. Git gud or git out";
        textPacket.sendTo(networkIdentifier);
        textPacket.dispose();
    }, 10000);
});

var counter = 0;
events.levelTick.on(() => {
    var xmultiplier = Math.round(Math.random());
    var zmultiplier = Math.round(Math.random());
    var newSpawnPointX = Math.floor(Math.random()*Radius)*Multiplier[xmultiplier];
    var newSpawnPointZ = Math.floor(Math.random()*Radius)*Multiplier[zmultiplier];
    var SpawnCommand = "/setWorldSpawn ";
    SpawnCommand = SpawnCommand + String(newSpawnPointX) + " 64 " + String(newSpawnPointZ);
    bedrockServer.executeCommand(SpawnCommand, true);
    bedrockServer.executeCommand("/gamerule spawnRadius 128", true);
    counter = counter + 1;
    if (counter >= 40){
        //bedrockServer.executeCommand("/clone 0 -60 0 0 -60 0 0 -60 1", true);
        counter = 0;
    }
});

//add ability to break cursed end portals
events.blockDestructionStart.on(ev =>{
    var dim = ev.player.getDimension();
    var Xpos = ev.blockPos.x;
    var Ypos = String(ev.blockPos.y);
    var Zpos = String(ev.blockPos.z);
    if(bedrockServer.executeCommand("/testforblock " + String(Xpos) + " " + Ypos + " " + Zpos + " " + "end_portal", true).result == 1){
        var firsttest = bedrockServer.executeCommand("/testforblock " + String(Xpos + 1) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        var secondtest = bedrockServer.executeCommand("/testforblock " + String(Xpos + 2) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        var thirdtest = bedrockServer.executeCommand("/testforblock " + String(Xpos + 3) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        if (firsttest + secondtest + thirdtest == 1536){
            bedrockServer.executeCommand("/fill " + String(Xpos) + " " + Ypos + " " + Zpos + " " + String(Xpos) + " " + Ypos + " " + Zpos + " air", true)
        }
    }
});
