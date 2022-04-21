/* eslint-disable no-restricted-imports */
// General utilities for unaestheticminecraft.com
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { command } from "./bdsx/command";
import { TextPacket } from "bdsx/bds/packets";
import { DeviceOS } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";

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


//check inventory
/*
command.register("check-inv", "Swaps player inventories").overload((param, origin, output) =>{
    console.log("bruh");
});
*/

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
