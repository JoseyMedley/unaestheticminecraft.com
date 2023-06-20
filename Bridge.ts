const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// BDSX Imports
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { bedrockServer } from "bdsx/launcher";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { ServerPlayer } from "bdsx/bds/player";
var serverShutdown = false;

// Player List
const connectionList = new Map<NetworkIdentifier, string>();

//get path of main nodejs binary
var patharray = process.env.PATH?.split(";");
if (patharray == undefined) process.exit(); //not happening but to make vscode stop complaining
var nodepath = "";
for (var i = 0; i < patharray.length && nodepath === ""; i++)
{
    if (patharray[i].includes("nodejs"))
    {
        nodepath = patharray[i] + "node.exe";
    }
}

// Create config json if it doesn't exist
if (!fs.existsSync("./config/Bridge/config.json") ) {
    const defaultConfig = {
        "token": "insert token here",
        "chanID": "920529674998804530",
        "botEnabled": true,
        "postDiscordMessagesToConsole": true,
        "enableJoinLeaveMessages": true,
        "enableServerStartStopMessages": true
    };
    const jsonString = JSON.parse(JSON.stringify(defaultConfig));
    if (!fs.existsSync("./config")) {
        fs.mkdir("./config", (err: any) => {
            if (err) {
                console.log("Error creating config folder" + err);
            }
        });
    }
    if (!fs.existsSync("./config/Bridge")) {
        fs.mkdir("./config/Bridge", (err: any) => {
            if (err) {
                console.log("Error creating Bridge folder" + err);
            }
        });
    }
    fs.writeFileSync("./config/Bridge/config.json", JSON.stringify(jsonString, null, 2), (err: any) => {
        if (err) {
            console.log("Error creating default config.json file" + err);
        } else {
            console.log("Created a default config.json file.");
            console.log("Please set your configuration values!");
        }
    });
};

//save variables from config file
var token = GetConfig("token");
var chanID = GetConfig("chanID");
var botEnabled = GetConfig("botEnabled");
var postDiscordMessagesToConsole = GetConfig("postDiscordMessagesToConsole");
var enableJoinLeaveMessages = GetConfig("enableJoinLeaveMessages");
var enableServerStartStopMessages = GetConfig("enableServerStartStopMessages");

//launches bridge in separate process since bdsx cant support discord.js 14
var bridge = childProcess.fork(__dirname + '/BridgeChildProcess', {execPath:nodepath});

// On Server Close
events.serverClose.on(()=>{
    if ( /*GetConfig("EnableServerStartStopMessages")  == */true ) {
        //SendToDiscord("Server Shutting Down!", "Server");
        console.log('Discord Bridge Shutting Down.');
    }
    serverShutdown = true;
    bridge.kill("SIGINT");
});



// Player Join
events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {

    const connreq = ptr.connreq;
    if(!connreq || connreq == null){
        console.log("Bad connreq");
    }
    else{
        const cert = connreq.getCertificate();
        //const links = require(path.resolve(__dirname, process.cwd() + "/config/Bridge/links.json"));
        const xuid = cert.getXuid();
        const username = cert.getId();
        //links.xuids[xuid] = username;
        //fs.writeFileSync("./configs/Discord-Chatter/links.json", JSON.stringify(links, null, 2));
        if (!username) return;
        connectionList.set(networkIdentifier, username);

        if (enableJoinLeaveMessages == true) {
            bridge.send({bridgeEvent: 'Join', playerName: username});
        }
    }
});

// Player Leave
events.networkDisconnected.on(networkIdentifier => {

    if (enableJoinLeaveMessages == true) {
        const id = connectionList.get(networkIdentifier);
        connectionList.delete(networkIdentifier);
        if(id != undefined){
            bridge.send({bridgeEvent: 'Leave', playerName: id});
        }
    }
});

//send chats to child process
events.packetAfter(MinecraftPacketIds.Text).on(ev => {
    bridge.send({bridgeEvent: 'gameMessage', playerName: ev.name, message: ev.message});
});

//receive discord messages from child process and send to game
bridge.on('message', (ev) =>{
    if (ev.bridgeEvent == 'discordMessage'){
        SendToGame(ev.content, ev.playerName, ev.orig_msg);
    }
});

function SendToGame(message: string, user: string, orig_msg: any) {
    
    
    /*if (GetVerifiedUsers("getxuid_"+orig_msg.author.id) != undefined)
    {
        let xuid:string = GetVerifiedUsers("getxuid_"+orig_msg.author.id);
        let player = GetPlayerFromXuid(xuid);
        user = "§2"+player;
    }
    */
    // Timestamp
    var date_time = new Date();
    var date = ("0" + date_time.getDate()).slice(-2);
    var month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    var year = date_time.getFullYear();
    var hours = ("0" + date_time.getHours()).slice(-2);
    var minutes = ("0" + date_time.getMinutes()).slice(-2);
    var seconds = ("0" + date_time.getSeconds()).slice(-2);
    // Prints YYYY-MM-DD HH:MM:SS format - Allow format changing in config!
    var timestamp = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    
    // Actual Messages
    if (!message.startsWith("-verify ") && !message.startsWith("-unverify")){
    bedrockServer.executeCommand("tellraw @a { \"rawtext\" : [ { \"text\" : \"<§9[DISCORD]§r " + user + "§r> " + message.replace("\"", "\'").replace("\\","\\\\").replace("\"", "").replace("@", "\@")+"\" } ] }", false);
    if (postDiscordMessagesToConsole == true) {console.log("[" + timestamp + " CHAT] <[DISCORD] " + user + "> " + message)};
    }
    /*
    else if (message.startsWith("-verify ")){

        let verify_me = message.split("-verify ")[1];
        const links = require(path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/links.json"));
        if (orig_msg.author.id in links.users){
            orig_msg.channel.send("<@!"+orig_msg.author.id+"> Already verified (maybe with another XBOX account? Use -unverify to unverify)");
            return;
        }
        var found_user = false;
        bedrockServer.serverInstance.getPlayers().forEach(usr => {
            if (usr.getName() == verify_me){
                found_user = true;
                bedrockServer.executeCommand("tellraw "+usr.getName().replace("\"", "\'").replace("\\","\\\\")+" { \"rawtext\" : [ { \"text\" : \"§9"+orig_msg.author.tag+"§r wants to verify their Discord account with your Minecraft account. Type §2/verify§r to verify.\" } ] }", false);
                orig_msg.channel.send("<@!"+orig_msg.author.id+"> Sent you a verify request, which is valid for five minutes. Use /verify ingame.");
                players_to_verified.push(""+Date.now()+"_"+orig_msg.author.id+"_"+usr.getCertificate().getXuid());
            }
        })
        if (!found_user){
            orig_msg.channel.send("<@!"+orig_msg.author.id+"> Couldn't find a player with the username "+verify_me+". Please make sure you are online.");
        }
    }
    else if (message.startsWith("-unverify")){
        // TODO add unverify via dc
    }
    */
};


// send death messages to discord
/*events.packetSend(MinecraftPacketIds.Text).on((ev, ni) => {
    if (ev.needsTranslation && ev.message.startsWith("death")){
        let msg = ev.message;
        let params = ev.params;
        let rawdata = fs.readFileSync('deathmsgs.json');
        let deathmsgs = JSON.parse(rawdata);
        if (deathmsgs[msg].includes("%1") && params.get(0) == null) {return}
        if (deathmsgs[msg].includes("%2") && params.get(1) == null) {return}
        if (deathmsgs[msg].includes("%3") && params.get(2) == null) {return}
        if (params.get(0) != null && params.get(0).startsWith("%")) {return}
        if (params.get(1) != null && params.get(1).startsWith("%")) {return}
        if (params.get(2) != null && params.get(3).startsWith("%")) {return}
        var chatmessage = deathmsgs[msg].replace("%1", params.get(0)).replace("%2", params.get(1)).replace("%3", params.get(2));
        var playername = chatmessage.split(" ")[0];
        if (playername != ni.getActor()?.getName()) return;
        //SendToDiscordEvent(chatmessage);
    }
});








command.register("verify", "Verify's your discord account").overload((param: any, origin: any, output: any) =>{
    let xuid = (origin.getEntity() as ServerPlayer).getCertificate().getXuid();
    var is_verified = false;
    players_to_verified.forEach(tmpvar => {
        let ver_time = tmpvar.split("_")[0];
        let dc_uid:string = tmpvar.split("_")[1];
        let mc_xuid:string = tmpvar.split("_")[2];
        if (mc_xuid == xuid && !is_verified)
        {
            is_verified = true;
            let time_diff = Date.now()-(ver_time as any);
            if (time_diff > 300000) // Five minutes are over
            {
                bedrockServer.executeCommand("tellraw "+origin.getName()+" { \"rawtext\" : [ { \"text\" : \"§4§lError:\n§rYour verify request timed out or was accepted.\" } ] }", false);
            }
            else
            {
                const links = require(path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/links.json"))
                if (xuid in links.users){
                    bedrockServer.executeCommand("tellraw "+origin.getName()+" { \"rawtext\" : [ { \"text\" : \"§4§lError:\n§rAlready verified (potentially with another account. Use /unverify to unverify the other account)\" } ] }", false);
                }
                else {
                    AppendVerifiedUser(dc_uid, mc_xuid);
                    bedrockServer.executeCommand("tellraw "+origin.getName()+" { \"rawtext\" : [ { \"text\" : \"Verified!\" } ] }", false);
                }
            }
        }
    });
    if (!is_verified){
        bedrockServer.executeCommand("tellraw "+origin.getName()+" { \"rawtext\" : [ { \"text\" : \"§4§lError:\n§rYou do not have a verify request. Type -verify "+origin.getName()+" into the discord server to verify yourself. (Or perhaps you are already verified, use -unverify to unverify then)\" } ] }", false);
    }
}, {});

function GetVerifiedUsers(key: any) {
    const configPath = path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/links.json");
    const config = require(configPath);


    if (key == "all"){
        return config.users;
    }
    else if (key.startsWith("getxuid_")) {
        return config.users[key.split("getxuid_")[1]];

    }
    else if (key.startsWith("getdcid_")) {
        return config.users[key.split("getdcid_")[1]];

}}

function GetPlayerFromXuid(xuid: any){
    const players = require(path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/links.json"));
    return players.xuids[xuid]
}


function AppendVerifiedUser(dcid: string, xuid: string){
    var verified_users = require(process.cwd() + "/configs/Discord-Chatter/links.json")
    // verified_users.users.push([dcid, xuid])
    verified_users.users[dcid] = xuid
    fs.writeFileSync("./configs/Discord-Chatter/links.json", JSON.stringify(verified_users, null, 2))
}

*/

//get values from config file
function GetConfig(key: any) {
    const configPath = path.resolve(__dirname, process.cwd() + "/config/Bridge/config.json");
    const config = require(configPath);

    switch (key) {
        case "token":
            return config.token;
        case "chanID":
            return config.chanID;
        case "botEnabled":
            return config.botEnabled;
        case "postDiscordMessagesToConsole":
            return config.postDiscordMessagesToConsole;
        case "enableJoinLeaveMessages":
            return config.enableJoinLeaveMessages;
        case "enableServerStartStopMessages":
            return config.enableServerStartStopMessages;
        default:
            return null;
    }
}
