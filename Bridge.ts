import { version as currVersion } from "./package.json";

const fs = require('fs');
const path = require('path');
var players_to_verified: string[] = [];
var serverShutdown = false;
var playerlogchanid = "995024446005981205";
// Create config json if it doesn't exist
if (!fs.existsSync("./configs/Discord-Chatter/config.json") ) {
    const defaultConfig = {
        "token": "insert token here",
        "chanID": "920529674998804530",
        "BotEnabled": true,
        "PostDiscordMessagesToConsole": true,
        "EnableJoinLeaveMessages": true,
        "EnableServerStartStopMessages": true
    };
    const jsonString = JSON.parse(JSON.stringify(defaultConfig));
    if (!fs.existsSync("./configs")) {
        fs.mkdir("./configs", (err: any) => {
            if (err) {
                console.log("[DiscordChatter] Error creating default config.json file" + err);
            }
        });
    }
    if (!fs.existsSync("./configs/Discord-Chatter")) {
        fs.mkdir("./configs/Discord-Chatter", (err: any) => {
            if (err) {
                console.log("[DiscordChatter] Error creating default config.json file" + err);
            }
        });
    }
    fs.writeFileSync("./configs/Discord-Chatter/config.json", JSON.stringify(jsonString, null, 2), (err: any) => {
        if (err) {
            console.log("[DiscordChatter] Error creating default config.json file" + err);
        } else {
            console.log("[DiscordChatter] Created a default config.json file.");
            console.log("[DiscordChatter] Please set your configuration values!");
            console.log("[DiscordChatter] Run `dc config help` in the console for more info.");
        }
    });
};



// BDSX Imports
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { bedrockServer } from "bdsx/launcher";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { ServerPlayer } from "bdsx/bds/player";

// Discord Bot Requirements
const Discord = require('discord.js');
var bot = new Discord.Client({ disableEveryone: true });

console.log("[DiscordChatter] Starting DiscordChatter!");
console.log(`[DiscordChatter] DiscordChatter is version ${currVersion}.`);
if ( GetConfig("BotEnabled")  == true ) {
    bot.login(GetConfig("token")).catch((e: string) => {
        if (e == "Error: An invalid token was provided." || e == "Error: Incorrect login details were provided.") {
            console.log("\n[DiscordChatter] Error in Discord.js: Invalid Login Token.");
            console.log("[DiscordChatter] You have provided an Invalid Login Token; Please run `dc config token {token}` in the console.");
            console.log("[DiscordChatter] DiscordChatter will not work without a proper token.\n");
        } else {
            console.log("[DiscordChatter] Uncaught Error! Please report this.");
            throw e;
        }
    });
}

// Bot Events
// Events related to discord.js

bot.on('ready', () => {
    console.info(`[DiscordChatter] Logged in as ${bot.user.tag}!`);
    console.info("[DiscordChatter] DiscordChatter has started.");

    if ( GetConfig("EnableServerStartStopMessages")  == true ) {
        SendToDiscord("Server Started!", "Server");
    }
    bot.user.setPresence({ activity: { name: 'Listening for chatter!' }, status: 'online' });
});

bot.on('message', (msg: { channel: { id: string; }; author: { bot: string | boolean; username: string; }; content: string; }) => {
    if (msg.channel.id == GetConfig("chanID") && msg.author.bot != true && msg.content.startsWith("X") != true) {
        SendToGame(msg.content, msg.author.username, msg);
    }
});

bot.on('disconnect', () => {
    if (serverShutdown) return;
    bot.destroy().then(() => bot.login(GetConfig("token")).catch((e: string) => {
        if (e == "Error: An invalid token was provided." || e == "Error: Incorrect login details were provided.") {
            console.log("\n[DiscordChatter] Error in Discord.js: Invalid Login Token.");
            console.log("[DiscordChatter] You have provided an Invalid Login Token; Please run `dc config token {token}` in the console.");
            console.log("[DiscordChatter] DiscordChatter will not work without a proper token.\n");
        } else {
            console.log("[DiscordChatter] Uncaught Error! Please report this.");
            throw e;
        }
    }));
});
// BDSX Events
// These are BDS defined events that should be tracked or a message should be sent on.

// Player List
const connectionList = new Map<NetworkIdentifier, string>();

// BDS Initialized?
var serverAlive = true;

// BDS Startup
// broken
//events.serverOpen.on(() => serverAlive = true);

events.serverOpen.on(() => {
    console.log("the event started");
    serverAlive = true;
});

// Player Join
events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {

    const connreq = ptr.connreq;
    if(!connreq){
        console.log("Bad connreq");
    }
    else{
        const cert = connreq.cert;
        const links = require(path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/links.json"));
        const xuid = cert.getXuid();
        const username = cert.getId();
        links.xuids[xuid] = username;
        fs.writeFileSync("./configs/Discord-Chatter/links.json", JSON.stringify(links, null, 2));
        if (username) connectionList.set(networkIdentifier, username);
        if ( GetConfig("EnableJoinLeaveMessages") == true ) {
            // Player Join (Extract Username)
            SendToDiscordEvent(username + " has joined the server!");
        }
    }
});

// Player Leave
events.networkDisconnected.on(networkIdentifier => {

    if ( GetConfig("EnableJoinLeaveMessages") == true ) {
        const id = connectionList.get(networkIdentifier);
        connectionList.delete(networkIdentifier);

        // Player Leave (Extract Username)
        if(id != undefined){
            SendToDiscordEvent(id + " has left the server!");
        }
    }
});

// player death
events.packetSend(MinecraftPacketIds.Text).on((ev, ni) => {
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
        SendToDiscordEvent(chatmessage);
    }
});



// Chat Message Sent
events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    SendToDiscord(ev.message, ev.name);
});

// On Server Close
events.serverClose.on(()=>{
    if ( GetConfig("EnableServerStartStopMessages")  == true ) {
        SendToDiscord("Server Shutting Down!", "Server");
        console.log('[DiscordChatter] Shutting Down.');
    }
    serverShutdown = true;
    bot.destroy(); // Node doesn't shutdown w/o this; It just freezes
});



// Message Functions
// These functions facilitate communication between Discord and the Server.

function SendToPlayerLog(message: string) {
    if ( GetConfig("BotEnabled") == true ) {
        const chan = bot.channels.get(playerlogchanid);
        try {
            chan.send(message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("[DiscordChatter] Error in discord.js: Missing permissions.");
                    console.log("[DiscordChatter] Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("[DiscordChatter] Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\n[DiscordChatter] Failed to send message to the Discord Server!");
                console.log("[DiscordChatter] Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("[DiscordChatter] Please double check the related values and fix them.\n");
            } else {
                console.log("[DiscordChatter] Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
}

function SendToDiscord(message: string, user: string) {
    if ( GetConfig("BotEnabled") == true ) {
        const chan = bot.channels.get(GetConfig("chanID"));
        try {
            chan.send("[" + user + "] " + message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("[DiscordChatter] Error in discord.js: Missing permissions.");
                    console.log("[DiscordChatter] Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("[DiscordChatter] Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\n[DiscordChatter] Failed to send message to the Discord Server!");
                console.log("[DiscordChatter] Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("[DiscordChatter] Please double check the related values and fix them.\n");
            } else {
                console.log("[DiscordChatter] Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
};

function SendToDiscordEvent(message: string) {
    if ( GetConfig("BotEnabled") == true ) {
        const chan = bot.channels.get( GetConfig("chanID") );
        try {
            chan.send(message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("[DiscordChatter] Error in discord.js: Missing permissions.");
                    console.log("[DiscordChatter] Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("[DiscordChatter] Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\n[DiscordChatter] Failed to send message to the Discord Server!");
                console.log("[DiscordChatter] Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("[DiscordChatter] Please double check the related values and fix them.\n");
            } else {
                console.log("[DiscordChatter] Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
};

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


function SendToGame(message: string, user: string, orig_msg: any) {
    if (serverAlive == false) {
        return;
    }
    if (GetVerifiedUsers("getxuid_"+orig_msg.author.id) != undefined)
    {
        let xuid:string = GetVerifiedUsers("getxuid_"+orig_msg.author.id);
        let player = GetPlayerFromXuid(xuid);
        user = "§2"+player;
    }
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
    if ( GetConfig("PostDiscordMessagesToConsole") == true ) { console.log("[" + timestamp + " CHAT] <[DISCORD] " + user + "> " + message) };
}
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
};

/*
function ReloadBot() {
    if ( GetConfig("BotEnabled") == true ) {
        console.log("[DiscordChatter] Restarting DiscordChatter!");
        console.log(`[DiscordChatter] DiscordChatter is version ${currVersion}.`);
        bot.destroy().then(() => bot.login(GetConfig("token")).catch((e: string) => {
            if (e == "Error: An invalid token was provided." || e == "Error: Incorrect login details were provided.") {
                console.log("\n[DiscordChatter] Error in Discord.js: Invalid Login Token.");
                console.log("[DiscordChatter] You have provided an Invalid Login Token; Please run `dc config token {token}` in the console.");
                console.log("[DiscordChatter] DiscordChatter will not work without a proper token.\n");
            } else {
                console.log("[DiscordChatter] Uncaught Error! Please report this.");
                throw e;
            }
        }));
    } else {
        let disabled = new Error("Bot is disabled!");
        throw disabled;
    }
}
*/

function GetConfig(key: any) {
    const configPath = path.resolve(__dirname, process.cwd() + "/configs/Discord-Chatter/config.json");
    const config = require(configPath);

    switch (key) {
        case "token":
            return config.token;
        case "chanID":
            return config.chanID;
        case "BotEnabled":
            return config.BotEnabled;
        case "PostDiscordMessagesToConsole":
            return config.PostDiscordMessagesToConsole;
        case "EnableJoinLeaveMessages":
            return config.EnableJoinLeaveMessages;
        case "EnableServerStartStopMessages":
            return config.EnableServerStartStopMessages;
        default:
            return null;
    }
}

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

/*function UpdateConfig(key: string, value: string | boolean | undefined) {
    var defaultConfig = {
        "token": "null",
        "chanID": "null",
        "BotEnabled": true,
        "PostDiscordMessagesToConsole": false,
        "EnableJoinLeaveMessages": true,
        "EnableServerStartStopMessages": true
    }
    if (!fs.existsSync("./configs/Discord-Chatter/config.json") ) {
        var jsonString = JSON.parse(JSON.stringify(defaultConfig));
        jsonString[key] = value;
        fs.writeFileSync("./configs/Discord-Chatter/config.json", JSON.stringify(jsonString, null, 2), (err: any) => {
            if (err) {
                console.log("[DiscordChatter] Error creating default config.json file" + err)
                return 1;
            } else {
                console.log("[DiscordChatter] Created a default config.json file.")
                console.log("[DiscordChatter] Please set your configuration values!");
                console.log("[DiscordChatter] Run `dc config help` in the console for more info.");
                return 1;
            }
        });
        return 0;
    } else {
        var config = require(process.cwd() + "/configs/Discord-Chatter/config.json");
        switch (key) {
            case "token":
                config.token = value;
                break;
            case "chanID":
                config.chanID = value;
                break;
            case "BotEnabled":
                if ( value == "true" ) {
                    config.BotEnabled = true;
                    break;
                } else if (value == "false" ) {
                    config.BotEnabled = false;
                    break;
                }
                return 1;
            case "PostDiscordMessagesToConsole":
                if ( value == "true" ) {
                    config.PostDiscordMessagesToConsole = true;
                    break;
                } else if (value == "false" ) {
                    config.PostDiscordMessagesToConsole = false;
                    break;
                }
                return 1;
            case "EnableJoinLeaveMessages":
                if ( value == "true" ) {
                    config.EnableJoinLeaveMessages = true;
                    break;
                } else if (value == "false" ) {
                    config.EnableJoinLeaveMessages = false;
                    break;
                }
                return 1;
            case "EnableServerStartStopMessages":
                if ( value == "true" ) {
                    config.EnableServerStartStopMessages = true;
                    break;
                } else if (value == "false" ) {
                    config.EnableServerStartStopMessages = false;
                    break;
                }
                return 1;
            default:
                return 1;
        }
        fs.writeFileSync("./configs/Discord-Chatter/config.json", JSON.stringify(config, null, 2), (err: any) => {
            if (err) {
                console.log("[DiscordChatter] Error writing to config.json file" + err);
                return 1;
            }
        });
        return 0;
    }
}*/
