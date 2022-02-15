//change radius to modify the spawn radius
const system = server.registerSystem(0, 0);
var Radius = 872;
var Multiplier = [1,-1];
console.log("SystemUpdateFunction loaded");
system.executeCommand("/gamerule showcoordinates true", () => {});
//var counter = 0;

//runs every tick
system.update = function () {

    // changes spawn location to random point within the specified radius
    var xmultiplier= Math.round(Math.random());
    var zmultiplier= Math.round(Math.random());
    var newSpawnPointX= Math.floor(Math.random()*Radius)*Multiplier[xmultiplier];
    var newSpawnPointZ= Math.floor(Math.random()*Radius)*Multiplier[zmultiplier];
    var SpawnCommand="/setWorldSpawn ";
    SpawnCommand= SpawnCommand + String(newSpawnPointX) + " 64 " + String(newSpawnPointZ);
    system.executeCommand(SpawnCommand, () => {});
    system.executeCommand("/gamerule spawnRadius 128", () => {});

    //patch GMC
    system.executeCommand("/testfor @a[m=c]", (out) => {
        var iscreative = out.data.statusMessage;
        if (iscreative != "No Targets Matched Selector"){
            //system.executeCommand("/gamemode s @a[tag=!admin]", () => {});
        }
    });

    //doop
    /*
    counter = counter + 1;
    if (counter >= 20){
        system.executeCommand("/clone 0 -60 0 0 -60 0 0 -60 1", () => {});
        counter = 0;
    }
    */
};
