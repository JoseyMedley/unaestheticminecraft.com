/* eslint-disable no-restricted-imports */
// General utilities for unaestheticminecraft.com
import { system } from "./example_and_test/bedrockapi-system";
import { CommandRawText } from "./bdsx/bds/command";
import { Packet } from "./bdsx/bds/packet";
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { command } from "./bdsx/command";
import { getOriginalNode } from "typescript";

console.log("initializing Utilities");

command.register("suicide", "respawns yourself").overload((param, origin, output) =>{
    var playername = origin.getName();
    var newcommand = "/kill " + playername;
    system.executeCommand(newcommand, () => {});
}, {});


// logs chat
events.packetBefore(MinecraftPacketIds.Text).on(ev=>{
    console.log(ev.name + ": " + ev.message);
});


//check inventory
