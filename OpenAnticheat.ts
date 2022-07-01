/* eslint-disable no-restricted-imports */
import { NetworkIdentifier } from "./bdsx/bds/networkidentifier";
import { CANCEL } from "./bdsx/common"
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { events } from "./bdsx/event";
import { ServerPlayer } from "bdsx/bds/player";
import { CompoundTag, ListTag, ShortTag } from "bdsx/bds/nbt";
import { BlockPos } from "bdsx/bds/blockpos";
import { CxxVector } from "bdsx/cxxvector";
import { int16_t } from "bdsx/nativetype";
import { bedrockServer } from "bdsx/launcher";
import { hex } from "bdsx/util";
import { PlayerActionPacket } from "bdsx/bds/packets";
console.log("Open Anticheat loaded");

// illegal entities and blocks
var illegalEntities = ["minecraft:ender_dragon", "minecraft:phantom", "minecraft:elder_guardian_ghost", "minecraft:npc", "minecraft:agent", "minecraft:tripod_camera", "minecraft:chalkboard", "minecraft:command_block_minecart"];
var illegalBlocks = ["tile:invisiblebedrock", "minecraft:end_portal_frame", "minecraft:mob_spawner", "minecraft:allow", "minecraft:deny",
"minecraft:border_block", "minecraft:structure_void", "minecraft:camera", "minecraft:structure_block", "minecraft:nether_reactor", "minecraft:glowingobsidian", "minecraft:barrier",
"minecraft:command_block", "minecraft:repeating_command_block", "minecraft:chain_command_blocks", "minecraft:bedrock", "minecraft:jigsaw"];
var illegalItems = ["minecraft:spawn_egg"];

//illegal entities patch
events.entityCreated.on((ev)=>{
    var entity = ev.entity;
    var Id = entity.getIdentifier();
    if (illegalEntities.indexOf(Id) != -1){
        entity.despawn();
        console.log("Illegal Entity Despawned");
    }
});

// patch placing illegal blocks
// working a bit too well
events.blockPlace.on((ev)=>{
    if (ev.block != null && ev.block != undefined){
        var blockName = ev.block.getName();
        if (ev.player != null && ev.player != undefined){
            var playername = ev.player.getName();
            var permissions = ev.player.getPermissionLevel();
            if (illegalBlocks.indexOf(blockName) != -1 && permissions < 2){
                console.log("Illegal block: " + blockName + " rejected from player: " + playername);
                return CANCEL;
            }
        }
    }
});

//.give patch
events.packetRaw(MinecraftPacketIds.InventoryTransaction).on((ptr, size, ni) => {
    for (let i = 0; i < size; i++) {
        try {
            if (ptr.readVarUint() === 99999) {
                var playername = ni.getActor()?.getName();
                if (playername == undefined) return CANCEL;
                console.log(playername + " used fake inventory transaction packets");
                bedrockServer.serverInstance.disconnectClient(ni, `I don't .give a shit`);
                return CANCEL;
            }
        } catch {}
    }
});

//crasher/elytra patch
events.packetBefore(MinecraftPacketIds.PlayerAuthInput).on((pk, ni) => {
    if ((pk.moveX === 4294967296 && pk.moveZ === 4294967296) || (pk.pos.x === 4294967296 && pk.pos.y === 4294967296 && pk.pos.z === 4294967296)) {
        var playername = ni.getActor()?.getName();
        if (playername == undefined) return CANCEL;
        console.log(playername + " used crasher");
        bedrockServer.serverInstance.disconnectClient(ni, `Did you really think that shit would work here`);
        return CANCEL;
    }
});

events.packetRaw(MinecraftPacketIds.Disconnect).on(ev => {
    console.log("Disconnect DoS attempted");
    return CANCEL;
});

events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on(ptr =>{
    ptr.readVarUint();
    if (ptr.readVarUint() >= 0xfff){
        console.log("Overflow DoS attempted");
        return CANCEL;
    }
    if (ptr.readVarUint() >= 0xfff){
        console.log("Overflow DoS attempted");
        return CANCEL;
    }
});

//Fakename patch
//Thanks to Aniketos for this one
const names = new Map<NetworkIdentifier, string>();
const currentmessages = new Map<NetworkIdentifier, string>();
const points = new Map<NetworkIdentifier, int16_t>();
events.packetAfter(MinecraftPacketIds.Login).on((pk, ni) => {
    let connreq = pk.connreq;
    if (!connreq) return;
    let cert = connreq.cert;
    names.set(ni, cert.getIdentityName());
    currentmessages.set(ni, "");
    points.set(ni, 0);
});

events.packetSend(MinecraftPacketIds.PlayStatus).on((pk, ni) => {
    if (pk.status === 3) {
        if (names.get(ni)) {
            if (ni.getActor()!.getName() !== names.get(ni)) {
                console.log(names.get(ni) + " used fakename");
                bedrockServer.serverInstance.disconnectClient(ni, `Use your real username dipshit`);
            }
        }
    }
});

const enchants = {
    0:  4,
    1:  4,
    2:  4,
    3:  4,
    4:  4,
    5:  0, //this is thorns. revert this to 3 if it no longer crashes servers
    6:  3,
    7:  3,
    8:  1,
    9:  5,
    10: 5,
    11: 5,
    12: 2,
    13: 2,
    14: 3,
    15: 5,
    16: 1,
    17: 3,
    18: 3,
    19: 5,
    20: 2,
    21: 1,
    22: 1,
    23: 3,
    24: 3,
    25: 3,
    26: 1,
    27: 1,
    28: 1,
    29: 5,
    30: 1,
    31: 3,
    32: 1,
    33: 1,
    34: 3,
    35: 3,
    36: 3
}

//32k patch. First version by DAMcraft. Improved by thesoulblazer. Then re-made to all items by DAMcraft and modified to the nbt branch
events.playerInventoryChange.on((ev)=>{
    let player = ev.player;
    if (!player) return; 
    player.getInventory().container.getSlots().toArray().forEach(item => {
        if (item.getUserData() != null){
            let ud = item.getUserData();
            if (ud.get("ench") != null){
                let ench = (ud.get("ench") as ListTag).data.toArray();
                ench.forEach(tmp =>{
                    let enchantment = tmp as CompoundTag;
                    let lvl = (enchantment.get('lvl') as ShortTag).data;
                    let id = (enchantment.get('id') as ShortTag).data;
                    let allowed_lvl = enchants[id as keyof typeof enchants];
                    if (allowed_lvl < lvl) {
                        console.log("Reverted an overenchanted item");
                        enchantment.set("lvl", ShortTag.constructWith(Number(allowed_lvl)));
                    }
                });
            }
        }
    });
});

function indexOfMin(arr: any[]) {
    if (arr.length === 0) {
        return -1;
    }
    var min = arr[0];
    var minIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }
    return minIndex;
}

var logBackup = console.log;
var logMessages: any[] = [];

console.log = function() {
    logMessages.push.apply(logMessages, arguments);
    logBackup.apply(console, arguments);
};

events.packetSend(MinecraftPacketIds.ContainerOpen).on(ev => {
    let x = ev.pos.x;
    let y = ev.pos.y;
    let z = ev.pos.z;
    let onplayers: any[] = [];
    let distances: any[] = [];
    bedrockServer.serverInstance.getPlayers().forEach(element => {
        let px = Math.round(element.getPosition().x);
        let pz = Math.round(element.getPosition().z);
        // console.log("Player pos: ", px, pz)
        let diff = Math.round(Math.hypot(px-x, pz-z));
        // console.log(diff)
        onplayers.push(element);
        distances.push(diff);
    });
    if (onplayers.length != distances.length){console.log("Somehow more distances got recorded then players.")} //Never happened to me before, but you never know
    else {
        let index = indexOfMin(distances);
        let nearest_player: ServerPlayer = onplayers[index];
        const region = nearest_player.getRegion();
        const bpos =  BlockPos.create(x, y, z);
        const blockEntity = region.getBlockEntity(bpos);
        if (region.getBlock(ev.pos).blockLegacy.getRenderBlock().getName() == "minecraft:undyed_shulker_box" || region.getBlock(ev.pos).blockLegacy.getRenderBlock().getName() == "minecraft:shulker_box"){
            if (blockEntity != null) {
                const tag = blockEntity.allocateAndSave();
                const items = tag.get("Items") as ListTag;
                for (const e of items.data as CxxVector<CompoundTag>) {
                    if (items != (null || undefined)){
                        const Name = "" + e.get("Name");
                        const Slot = ("" + e.get("Slot")).length;
                        if (Name == "minecraft:shulker_box" || Name == "minecraft:undyed_shulker_box"){
                            console.log("Cleared nested shulker from shulker at " + x +" "+ y +" "+ z + " (At slot " + Slot + ")");
                            if (y > 320){
                                y = y - 4294967296;
                                //forgive me jeebus for this bullshit fix
                            }
                            var dim = region.getDimension();
                            bedrockServer.executeCommand(`/replaceitem block ${x} ${y} ${z} slot.container ` + Slot + " stone", false);
                        }
                    }
                }
                tag.destruct();
            }
        }
    }
});

events.packetBefore(MinecraftPacketIds.Text).on((ev, ni, packetid) =>{
    if (ni == undefined) return;
    var msg = ev.message;
    var curr = currentmessages.get(ni);
    if (curr == undefined) return;
    currentmessages.set(ni, msg);
    if (curr == msg || msg.includes("minecraft bedrock utility mod")){
        var currpoints = points.get(ni);
        if (currpoints == undefined) return;
        if (currpoints >= 5){
            bedrockServer.serverInstance.disconnectClient(ni, `Stop fucking spamming`);
            return CANCEL;
        }
        points.set(ni, currpoints + 1);
        return CANCEL;
    }
});

events.networkDisconnected.on(ni => {
    names.delete(ni);
    currentmessages.delete(ni);
    points.delete(ni);
});

events.packetRaw(MinecraftPacketIds.InventoryTransaction).on((ptr, size, ni) => {
    ptr.move(1);
    const data = [];
    if (ptr.readVarInt()) {
        for (let i = 0; i < ptr.readVarUint(); i++) {
            const id = ptr.readUint8();
            const slots = [];
            for (let i = 0; i < ptr.readVarUint(); i++) {
                slots.push(ptr.readUint8());
            }
            data.push({
                id,
                slots,
            });
        }
        if (data.length >= 3) {
            if ((data[0].id === 28) &&
                (data[1].id === 159) && (data[1].slots[0] === 9) &&
                (data[2].slots.length === 0)) {
                    var playername = ni.getActor()?.getName();
                    if (playername == undefined) return CANCEL;
                    console.log(playername + " used fake inventory transaction packets");
                    bedrockServer.serverInstance.disconnectClient(ni, `I don't .give a shit`);
                    return CANCEL;
            }
        }
    }
});

events.packetRaw(MinecraftPacketIds.InventoryTransaction).on((ptr, size, ni) => {
    const data = hex(ptr.readBuffer(size));
    const index = data.indexOf("02 9F 8D 06 09");
    if (index !== -1) {
        var playername = ni.getActor()?.getName();
        if (playername == undefined) return CANCEL;
        console.log(playername + " used fake inventory transaction packets");
        bedrockServer.serverInstance.disconnectClient(ni, `I don't .give a shit`);
        return CANCEL;
    }
});
