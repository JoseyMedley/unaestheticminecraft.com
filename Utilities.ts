// suicide command for unaestheticminecraft.com
import { system } from "./example_and_test/bedrockapi-system";
import { command, ServerPlayer } from "bdsx";
import { Packet } from "./bdsx/bds/packet";
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";

console.log("initializing Utilities");
// this hooks all commands, but it cannot be executed by command blocks
command.hook.on((command, originName)=>{
    if (command === '/suicide') {
	    var newCommand = "/kill "+ originName;
        system.executeCommand(newCommand, result => {});
        return 0;
    }

});



// logs deaths and chat
