/* eslint-disable no-restricted-imports */
// General utilities for unaestheticminecraft.com
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { command } from "./bdsx/command";
import { TextPacket } from "bdsx/bds/packets";
import { BuildPlatform} from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { TransferPacket } from "bdsx/bds/packets";
import { CommandRawText } from "bdsx/bds/command";

command.register("transferserver", "transfers yourself to another server").overload((param, origin) =>{
    const transferPacket = TransferPacket.allocate();
    var ni = origin.getEntity()?.getNetworkIdentifier();
    if (!ni) return;
    transferPacket.address = String(param.address);
    transferPacket.port = Number(param.port);
    transferPacket.sendTo(ni, 0);
    transferPacket.dispose();
}, {address:CommandRawText, port:CommandRawText});

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
    const cert = connreq.getCertificate();
    const xuid = cert.getXuid();
    const username = cert.getId();

    // Player join log
    console.log(`Connection: ${username}> IP=${ip}, XUID=${xuid}, OS=${BuildPlatform[connreq.getDeviceOS()] || 'UNKNOWN'}`);
});

events.playerJoin.on(ev => {
    ev.player.sendMessage("Welcome to unaestheticminecraft.com. Use /suicide to respawn. Most god hacks don't work. Git gud or git out");
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
events.blockDestructionStart.on((ev) => {
    var player = ev.player;
    if (!player || player == undefined) {
        console.log("fake player tried to break blocks");
        return;
    }
    var playername = player.getName();
    var Xpos = ev.blockPos.x;
    var Ypos = String(ev.blockPos.y);
    var Zpos = String(ev.blockPos.z);
    if(bedrockServer.executeCommand("/execute " + playername + " ~ ~ ~ testforblock " + String(Xpos) + " " + Ypos + " " + Zpos + " " + "end_portal", true).result == 1) {
        var firsttest = bedrockServer.executeCommand("/execute " + playername + " ~ ~ ~ testforblock " + String(Xpos + 1) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        var secondtest = bedrockServer.executeCommand("/execute " + playername + " ~ ~ ~ testforblock " + String(Xpos + 2) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        var thirdtest = bedrockServer.executeCommand("/execute " + playername + " ~ ~ ~ testforblock " + String(Xpos + 3) + " " + Ypos + " " + Zpos + " " + "end_portal_frame", true).result;
        if (firsttest + secondtest + thirdtest == 1536) {
            bedrockServer.executeCommand("/execute " + playername + " ~ ~ ~" + " fill " + String(Xpos) + " " + Ypos + " " + Zpos + " " + String(Xpos) + " " + Ypos + " " + Zpos + " air", true);
        }
    }
});
