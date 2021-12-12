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
import { serverInstance } from "bdsx/bds/server";
import { Block, BlockSource } from "./bdsx/bds/block";
import { BlockPos } from "./bdsx/bds/blockpos";
import { DeviceOS } from "bdsx/common";
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


// patch placing illegal blocks
// working a bit too well
events.blockPlace.on((ev)=>{
    var blockName = ev.block.getName();
    var playername = ev.player.getName();
    var permissions = ev.player.getPermissionLevel();
    if (illegalBlocks.indexOf(blockName) != -1 && permissions < 2){
        console.log("Illegal block: " + blockName + " rejected from player: " + playername);
        return CANCEL;
    }
})

events.packetRaw(MinecraftPacketIds.InventoryTransaction).on((ptr, size, ni) => {
    for (let i = 0; i < size; i++) {
        try {
            if (ptr.readVarUint() === 99999) {
                var playername = ni.getActor()?.getName();
                console.log(playername + " used fake inventory transaction packets");
                serverInstance.disconnectClient(ni, `I don't .give a shit`);
                return CANCEL;
            }
        } catch { }
    }
});

//trying to brick crasher/elytra exploit
// probably working
events.packetBefore(MinecraftPacketIds.PlayerAuthInput).on((pk, ni) => {
    if ((pk.moveX === 4294967296 && pk.moveZ === 4294967296) || (pk.pos.x === 4294967296 && pk.pos.y === 4294967296 && pk.pos.z === 4294967296)) {
        var playername = ni.getActor()?.getName();
        console.log(playername + " used crasher");
        serverInstance.disconnectClient(ni, `Did you really think that shit would work here`);
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

//Fakename patch

const names = new Map<NetworkIdentifier, string>();

events.packetAfter(MinecraftPacketIds.Login).on((pk, ni) => {
    let connreq = pk.connreq;
    if (!connreq) return;
    let cert = connreq.cert;
    if (connreq.getJsonValue()!.DeviceOS !== DeviceOS.PLAYSTATION) {
        names.set(ni, cert.getIdentityName());
    }
});

events.packetSend(MinecraftPacketIds.PlayStatus).on((pk, ni) => {
    if (pk.status === 3) {
        if (names.get(ni)) {
            if (ni.getActor()!.getName() !== names.get(ni)) {
                console.log(names.get(ni) + " used fakename");
                serverInstance.disconnectClient(ni, `Use your real username dipshit`);
            }
        }
    }
});

events.networkDisconnected.on(ni => {
    names.delete(ni);
});
