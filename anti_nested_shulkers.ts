import { BlockActor, BlockSource } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { Item, ItemStack } from "bdsx/bds/inventory";
import { ByteTag, CompoundTag, ListTag, StringTag, Tag } from "bdsx/bds/nbt";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ServerPlayer } from "bdsx/bds/player";
import { serverInstance, ServerInstance } from "bdsx/bds/server";
import { CxxVector } from "bdsx/cxxvector";
import { events } from "./bdsx/event";
import { system } from "./example_and_test/bedrockapi-system";

console.log("Anti nested shulker loaded!")

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
    let x = ev.pos.x
    let y = ev.pos.y
    let z = ev.pos.z
    let onplayers: any[] = []
    let distances: any[] = []
    serverInstance.getPlayers().forEach(element => {
        let px = Math.round(element.getPosition().x)
        let pz = Math.round(element.getPosition().z)
        // console.log("Player pos: ", px, pz)
        let diff = Math.round(Math.hypot(px-x, pz-z))
        // console.log(diff)
        onplayers.push(element)
        distances.push(diff)
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
                const tag = blockEntity.constructAndSave();
                const items = tag.get("Items") as ListTag;
                for (const e of items.data as CxxVector<CompoundTag>) {
                    if (items != (null || undefined)){
                        const Name = ""+e.get("Name");
                        const Slot = (""+e.get("Slot")).length;
                        if (Name == "minecraft:shulker_box"){
                            console.log("Cleared nested shulker from shulker at "+x+" "+y+" "+z+" (At slot "+Slot+")");
                            if (y>320){
                                y = y - 4294967296;
                                //forgive me jeebus for this bullshit fix
                            }
                            system.executeCommand(`/replaceitem block ${x} ${y} ${z} slot.container `+Slot+" stone", () => {});
                        }
                    }
                }
                tag.destruct();
            }
        }
    }
});
