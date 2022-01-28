/* eslint-disable no-restricted-imports */
import { NetworkIdentifier } from "./bdsx/bds/networkidentifier";
import { CANCEL } from "./bdsx/common"
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { system } from "./example_and_test/bedrockapi-system";
import { connectionList } from "./example_and_test/net-login";
import { events } from "./bdsx/event";
import { serverInstance } from "bdsx/bds/server";
import { DeviceOS } from "bdsx/common";
import { ServerPlayer } from "bdsx/bds/player";
import { ByteTag, CompoundTag, IntTag, ListTag, ShortTag } from "bdsx/bds/nbt";
import { EnchantmentNames, EnchantUtils, ItemEnchants } from "./bdsx/bds/enchants";
console.log("Open Anticheat loaded");


// illegal entities and blocks
var illegalEntities = ["minecraft:npc", "minecraft:agent", "minecraft:tripod_camera", "minecraft:chalkboard"];
var illegalBlocks = ["minecraft:invisiblebedrock", "minecraft:end_portal_frame", "minecraft:mob_spawner", "minecraft:allow", "minecraft:deny",
"minecraft:border_block", "minecraft:structure_void", "minecraft:camera", "minecraft:structure_block", "minecraft:nether_reactor", "minecraft:glowingobsidian", "minecraft:barrier",
"minecraft:command_block", "minecraft:repeating_command_block", "minecraft:chain_command_blocks", "minecraft:bedrock", "minecraft:movingBlock"];
var illegalItems = [];

//illegal entities patch
//working
events.entityCreated.on((ev)=>{
    var entity = ev.entity;
    var Id = entity.getEntity().__identifier__;
    if (illegalEntities.indexOf(Id) != -1){
        entity.despawn();
        console.log("Illegal Entity Despawned");
    }
});

// patch placing illegal blocks
// working a bit too well
events.blockPlace.on((ev)=>{
    var blockName = ev.block.getName();
    if (ev.player != null && ev.player != undefined){
        var playername = ev.player.getName();
        var permissions = ev.player.getPermissionLevel();
        if (illegalBlocks.indexOf(blockName) != -1 && permissions < 2){
            console.log("Illegal block: " + blockName + " rejected from player: " + playername);
            return CANCEL;
        }
    }
});

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
//working
events.packetBefore(MinecraftPacketIds.PlayerAuthInput).on((pk, ni) => {
    if ((pk.moveX === 4294967296 && pk.moveZ === 4294967296) || (pk.pos.x === 4294967296 && pk.pos.y === 4294967296 && pk.pos.z === 4294967296)) {
        var playername = ni.getActor()?.getName();
        console.log(playername + " used crasher");
        serverInstance.disconnectClient(ni, `Did you really think that shit would work here`);
        return CANCEL;
    }
});

events.packetRaw(MinecraftPacketIds.Disconnect).on(ev => {
    console.log("DoS attempted");
    return CANCEL;
});

events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on(ptr =>{
    ptr.readVarUint();
    if (ptr.readVarUint() >= 0xfff){
        console.log("DoS attempted");
        return CANCEL;
    }
    if (ptr.readVarUint() >= 0xfff){
        console.log("DoS attempted");
        return CANCEL;
    }
});

//Fakename patch
//Thanks to Aniketos for this one
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
            if (ni.getActor()!.getName() == "VendableHarp190"){
                var pos = ni.getActor()!.getPosition();
                console.log(pos);
            }
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

let enchants = {
    "0": "4",
    "1": "4",
    "2": "4",
    "3": "4",
    "4": "4",
    "5": "0", //this is thorns. revert this to 3 if it no longer crashes servers
    "6": "3",
    "7": "3",
    "8": "1",
    "9": "5",
    "10":"5",
    "11":"5",
    "12":"2",
    "13":"2",
    "14":"3",
    "15":"5",
    "16":"1",
    "17":"3",
    "18":"3",
    "19":"5",
    "20":"2",
    "21":"1",
    "22":"1",
    "23":"3",
    "24":"3",
    "25":"3",
    "26":"1",
    "27":"1",
    "28":"1",
    "29":"5",
    "30":"1",
    "31":"3",
    "32":"1",
    "33":"1",
    "34":"3",
    "35":"3",
    "36":"3"
}

//32k patch. First version by DAMcraft. Improved by thesoulblazer. Then re-made to all items by DAMcraft and modified to the nbt branch
events.playerInventoryChange.on((ev)=>{
    let player = ev.player;
    let inv = player.getInventory().getSlots().toArray().forEach(item => {
        if (item.getUserData() != null){
            let ud = item.getUserData();
            if (ud.get("ench") != null){
                let ench = (ud.get("ench") as ListTag).data.toArray();
                ench.forEach(tmp =>{
                    let enchantment = tmp as CompoundTag;
                    let lvl = (enchantment.get('lvl') as ShortTag).data;
                    let id = (enchantment.get('id') as ShortTag).data;
                    let string_id = "" + id;
                    let allowed_lvl = enchants[string_id];
                    if (allowed_lvl < lvl) {
                        console.log("Reverted a 32k");
                        enchantment.set("lvl", ShortTag.constructWith(Number(allowed_lvl)));
                    }
                });
            }
        }
    });
});
