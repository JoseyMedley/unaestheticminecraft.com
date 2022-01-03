/* eslint-disable no-restricted-imports */
import { NetworkIdentifier } from "./bdsx/bds/networkidentifier";
import { CANCEL } from "./bdsx/common"
import { MinecraftPacketIds } from "./bdsx/bds/packetids";
import { system } from "./example_and_test/bedrockapi-system";
import { connectionList } from "./example_and_test/net-login";
import { events } from "./bdsx/event";
import { serverInstance } from "./bdsx/bds/server";
import { DeviceOS } from "./bdsx/common";
import { ServerPlayer } from "./bdsx/bds/player";
import { EnchantmentNames, EnchantUtils, ItemEnchants } from "./bdsx/bds/enchants";
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
        entity.despawn();
        console.log("Illegal Entity Despawned");
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

events.playerUseItem.on(ev=>{
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

events.packetBefore(MinecraftPacketIds.InventorySlot).on((ev, ni, packetid) =>{
    var bruh = ev;
});

//32k patch. First version by DAMcraft. Improved by thesoulblazer
events.playerInventoryChange.on((ev)=>{
    var player = ev.player;
    var helmet = player.getArmor(0);
    var chest =  player.getArmor(1);
    var pants =  player.getArmor(2);
    var boots =  player.getArmor(3);
    var helmet_ench = helmet.constructItemEnchantsFromUserData();
    var chest_ench = chest.constructItemEnchantsFromUserData();
    var pants_ench = pants.constructItemEnchantsFromUserData();
    var boots_ench = boots.constructItemEnchantsFromUserData();
    var save = false;

    for (const ench of helmet_ench.enchants1.toArray())
    {
        if ((ench.type == 0 || ench.type == 1 || ench.type == 2 || ench.type == 3 || ench.type == 4) && ench.level > 4){
            ench.level = 4;
            save = true;
        }
        else if (ench.type == 5 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 6 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 7 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 8 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
    }
    for (const ench of chest_ench.enchants1.toArray())
    {
        if ((ench.type == 0 || ench.type == 1 || ench.type == 2 || ench.type == 3 || ench.type == 4) && ench.level > 4){
            ench.level = 4;
            save = true;
        }
        else if (ench.type == 5 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 6 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 7 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 8 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
    }
    for (const ench of pants_ench.enchants1.toArray())
    {
        if ((ench.type == 0 || ench.type == 1 || ench.type == 2 || ench.type == 3 || ench.type == 4) && ench.level > 4){
            ench.level = 4;
            save = true;
        }
        else if (ench.type == 5 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 6 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 7 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 8 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
    }
    for (const ench of boots_ench.enchants1.toArray())
    {
        if ((ench.type == 0 || ench.type == 1 || ench.type == 2 || ench.type == 3 || ench.type == 4) && ench.level > 4){
            ench.level = 4;
            save = true;
        }
        else if (ench.type == 5 && ench.level > 0){
            ench.level = 0;
            save = true;
        }
        else if (ench.type == 6 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 7 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 8 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
    }
    for (const ench of helmet_ench.enchants2.toArray())
    {
        if ((ench.type == 9 || ench.type == 10 || ench.type == 11) && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if ((ench.type == 12 || ench.type == 13) && ench.level > 2){
            ench.level = 2;
            save = true;
        }
        else if (ench.type == 14 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 15 && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if (ench.type == 16 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
        else if ((ench.type == 17 || ench.type == 18) && ench.level > 3){
            ench.level = 3;
            save = true;
        }
    }
    for (const ench of chest_ench.enchants2.toArray())
    {
        if ((ench.type == 9 || ench.type == 10 || ench.type == 11) && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if ((ench.type == 12 || ench.type == 13) && ench.level > 2){
            ench.level = 2;
            save = true;
        }
        else if (ench.type == 14 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 15 && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if (ench.type == 16 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
        else if ((ench.type == 17 || ench.type == 18) && ench.level > 3){
            ench.level = 3;
            save = true;
        }
    }
    for (const ench of pants_ench.enchants2.toArray())
    {
        if ((ench.type == 9 || ench.type == 10 || ench.type == 11) && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if ((ench.type == 12 || ench.type == 13) && ench.level > 2){
            ench.level = 2;
            save = true;
        }
        else if (ench.type == 14 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 15 && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if (ench.type == 16 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
        else if ((ench.type == 17 || ench.type == 18) && ench.level > 3){
            ench.level = 3;
            save = true;
        }
    }
    for (const ench of boots_ench.enchants2.toArray())
    {
        if ((ench.type == 9 || ench.type == 10 || ench.type == 11) && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if ((ench.type == 12 || ench.type == 13) && ench.level > 2){
            ench.level = 2;
            save = true;
        }
        else if (ench.type == 14 && ench.level > 3){
            ench.level = 3;
            save = true;
        }
        else if (ench.type == 15 && ench.level > 5){
            ench.level = 5;
            save = true;
        }
        else if (ench.type == 16 && ench.level > 1){
            ench.level = 1;
            save = true;
        }
        else if ((ench.type == 17 || ench.type == 18) && ench.level > 3){
            ench.level = 3;
            save = true;
        }
    }
    for (const ench of helmet_ench.enchants3.toArray())
    {
        if(ench.type == 27){
            ench.level = 0;
            save = true;
        }
    }
    for (const ench of chest_ench.enchants3.toArray())
    {
        if(ench.type == 27){
            ench.level = 0;
            save = true;
        }
    }
    for (const ench of pants_ench.enchants3.toArray())
    {
        if(ench.type == 27){
            ench.level = 0;
            save = true;
        }
    }
    for (const ench of boots_ench.enchants3.toArray())
    {
        if(ench.type == 27){
            ench.level = 0;
            save = true;
        }
    }
    if (save) {
        helmet.saveEnchantsToUserData(helmet_ench);
        chest.saveEnchantsToUserData(chest_ench);
        pants.saveEnchantsToUserData(pants_ench);
        boots.saveEnchantsToUserData(boots_ench);
        console.log("Overenchanted items reverted");
    }
});
