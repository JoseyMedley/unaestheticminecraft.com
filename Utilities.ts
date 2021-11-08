//General utilities for unaestheticminecraft.com
import { system } from "./example_and_test/bedrockapi-system";
import { CommandRawText } from "./bdsx/bds/command";
import { Packet } from "./bdsx/bds/packet";
import { events } from "./bdsx/event";
import { MinecraftPacketIds } from "./bdsx/bds/packetids";

console.log("initializing Utilities");

/*command.register((command, originName)=>{
    if (command === '/suicide') {
	    var newCommand = "/kill "+ originName;
        system.executeCommand(newCommand, result => {});
        return 0;
    }

});
*/


// logs chat
events.packetBefore(MinecraftPacketIds.Text).on(ev=>{
    
    console.log(ev.name + ": " + ev.message);
});


//check inventory
