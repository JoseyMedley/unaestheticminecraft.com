/* eslint-disable no-restricted-imports */
import { NetworkIdentifier } from "./bdsx/bds/networkidentifier";
import { CANCEL } from "./bdsx/common"
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { system } from "./example_and_test/bedrockapi-system";
import { connectionList } from "./example_and_test/net-login";
import { events } from "./bdsx/event";
import { float32_t } from "./bdsx/nativetype";
import { hex, indexOfLine } from "./bdsx/util";
import { InventoryTransaction } from "./bdsx/bds/inventory";
import { Block, BlockSource } from "./bdsx/bds/block";
import { BlockPos } from "./bdsx/bds/blockpos";

console.log("Open Anticheat loaded");


// illegal entities and blocks
var illegalEntities = ["minecraft:npc", "minecraft:agent", "minecraft:tripod_camera", "minecraft:chalkboard"];
var illegalBlocks = ["minecraft:invisiblebedrock", "minecraft:end_portal_frame", "minecraft:mob_spawner", "minecraft:allow", "minecraft:deny",
"minecraft:border_block", "minecraft:structure_void", "minecraft:camera", "minecraft:structure_block", "minecraft:nether_reactor", "minecraft:glowingobsidian", "minecraft:barrier",
"minecraft:command_block", "minecraft:repeating_command_block", "minecraft:chain_command_blocks", "minecraft:bedrock"];
var illegalItems = [];

//trying to destroy illegal entities
//probably not working
events.entityCreated.on((ev)=>{
    var entity = ev.entity;
    var Id = entity.getEntity().__identifier__;
    if (illegalEntities.indexOf(Id) != -1){
        return CANCEL;
    }
});


//attempts to brick illegal items
/*
events.packetBefore(MinecraftPacketIds.ContainerOpen).on((ev)=>{
    var bruh = ev.containerId;
    var heh = ev.type
});

*/

/*
events.playerPickupItem.on((ev)=>{
    var bruh = ev.itemActor.identifier;
    if (illegalItems.indexOf(bruh) != -1){
        return CANCEL;
    }
});
*/

// patch placing illegal blocks
// working a bit too well
events.blockPlace.on((ev)=>{
    var blockName = ev.block.getName();
    if (illegalBlocks.indexOf(blockName) != -1){
        console.log("Illegal block: " + blockName + " rejected");
        return CANCEL;
    }
})




//attempt to brick .give based on PM code for inventory transaction packet
events.packetRaw(0x1E).on((ptr, size, ni)=>{
    ptr.move(1);
    var requestID = ptr.readVarInt();
    var length = ptr.readVarUint();
    if(requestID!=0){
        for(var i=0;i<length;i++){
            var useless = ptr.move(1);
            var secondLength = ptr.readVarUint();
            ptr.move(secondLength);
        }
    }
    var TransactionType = ptr.readVarUint();

    if(TransactionType==99999){
        console.log(".give detected");
        var id = connectionList.get(ni);
        console.log(String(id) + " used fake packets");
        system.executeCommand("/kick "+ String(id),()=>{});
    }

});





//trying to brick crasher/elytra exploit
// probably not working
events.packetBefore(0x90).on((ptr)=>{
    const Xposition = ptr.pos.x;
    const Yposition = ptr.pos.y;
    const Zposition = ptr.pos.z;
    if (Xposition ==0xFFFFFFFF || Yposition ==0xFFFFFFFF || Zposition ==0xFFFFFFFF){
        console.log("this fucking worked");
        return CANCEL;
    }
});



// block overpowered attacks
// working
events.entityHurt.on((ev)=>{
    var entity = ev.entity.getEntity().__identifier__;
    var dealtDamage = ev.damage;
    if (dealtDamage>200 && entity!="minecraft:ender_crystal"){
        return CANCEL;
    }
});

