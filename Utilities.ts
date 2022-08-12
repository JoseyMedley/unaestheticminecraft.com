/* eslint-disable no-restricted-imports */
// General utilities for unaestheticminecraft.com
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { command } from "./bdsx/command";
import { TextPacket } from "bdsx/bds/packets";
import { DeviceOS } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { TransferPacket } from "bdsx/bds/packets";
import { Command, CommandRawText } from "bdsx/bds/command";

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

    // send login message
    const pkt = TextPacket.allocate();
    pkt.type = TextPacket.Types.Raw;
    pkt.message = "Welcome to unaestheticminecraft.com. Use /suicide to respawn. Most god hacks don't work. Git gud or git out";
    pkt.sendTo(networkIdentifier)
    pkt.dispose();
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

command.register("/fly", "Adds permission to fly", CommandPermissionLevel.Operator).overload((param, origin, output) =>{
    var playername = origin.getName();
    var newcommand = "/ability " + playername + "mayfly true";
    bedrockServer.executeCommand(newcommand, true);
}, {});
