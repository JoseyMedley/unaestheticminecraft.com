const fs = require('fs');
const path = require('path');

var players_to_verified: string[] = [];
var playerlogchanid = "995024446005981205";
var serverShutdown = false;

//save variables from config file
var token = GetConfig("token");
var chanID = GetConfig("chanID");
var botEnabled = GetConfig("botEnabled");
var postDiscordMessagesToConsole = GetConfig("postDiscordMessagesToConsole");
var enableJoinLeaveMessages = GetConfig("enableJoinLeaveMessages");
var enableServerStartStopMessages = GetConfig("enableServerStartStopMessages");
console.log("Starting Discord bridge");
// Discord Bot Requirements
const Discord = require('discord.js');
var bot = new Discord.Client({ disableEveryone: true, intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages]});
if (botEnabled == true) {
    bot.login(token).catch((e: string) => {
        var err = String(e);
        if (err.startsWith("Error [TokenInvalid]")) {
            console.log("\nError in Discord.js: Invalid Login Token.");
            console.log("Discord bridge will not work without a proper token.\n");
        } else {
            console.log("Uncaught Error! Please report this.");
            console.log(e);
        }
    });
}

//may not work below here
// Bot Events
// Events related to discord.js

//sets bot status and sends "[Server]: Bridge Started" to discord
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    console.log("Discord bridge has started.");
    if (enableServerStartStopMessages  == true) {
        SendToDiscord("Bridge Started", "Server");
    }
    bot.user.setPresence({activity: {name: 'Sacrificing Goats'}, status: 'online'});
});

//sends messages from bridge channel to minecraft server
bot.on('message', (msg: {channel: {id: string;}; author: {bot: string | boolean; username: string; }; content: string; }) => {
    if (msg.channel.id == chanID && msg.author.bot != true && msg.content.startsWith("X") != true) {
        SendToGame(msg.content, msg.author.username, msg);
    }
});

//restart bot
bot.on('disconnect', () => {
    if (serverShutdown) return;
    bot.destroy().then(() => bot.login(token).catch((e: string) => {
        if (e == "Error: An invalid token was provided." || e == "Error: Incorrect login details were provided.") {
            console.log("\nError in Discord.js: Invalid Login Token.");
            console.log("You have provided an Invalid Login Token; Please run `dc config token {token}` in the console.");
            console.log("Discord bridge will not work without a proper token.\n");
        } else {
            console.log("Uncaught Error! Please report this.");
            throw e;
        }
    }));
});

// Message Functions
// These functions facilitate communication between Discord and the Server.

function SendToPlayerLog(message: string) {
    if (botEnabled == true) {
        const chan = bot.channels.get(playerlogchanid);
        try {
            chan.send(message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("Error in discord.js: Missing permissions.");
                    console.log("Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\nFailed to send message to the Discord Server!");
                console.log("Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("Please double check the related values and fix them.\n");
            } else {
                console.log("Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
}

function SendToDiscord(message: string, user: string) {
    if (botEnabled == true) {
        const chan = bot.channels.cache.get(chanID);
        try {
            chan.send("[" + user + "] " + message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("Error in discord.js: Missing permissions.");
                    console.log("Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\nFailed to send message to the Discord Server!");
                console.log("Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("Please double check the related values and fix them.\n");
            } else {
                console.log("Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
};

function SendToDiscordEvent(message: string) {
    if (botEnabled == true) {
        const chan = bot.channels.get(GetConfig("chanID") );
        try {
            chan.send(message).catch((e: any) => {
                if (e == "DiscordAPIError: Missing Permissions") {
                    console.log("Error in discord.js: Missing permissions.");
                    console.log("Ensure the bot is in your server AND it has send permissions in the relevant channel!");
                } else {
                    console.log("Uncaught Error! Please report this.");
                    throw e;
                }
            });
        } catch (e) {
            if (e == "TypeError: Unable to get property 'send' of undefined or null reference") {
                console.log("\nFailed to send message to the Discord Server!");
                console.log("Either your Token is incorrect, or the Channel ID is invalid.");
                console.log("Please double check the related values and fix them.\n");
            } else {
                console.log("Uncaught Error! Please report this.");
                throw e;
            }
        }
    }
};

function SendToGame(message: string, user: string, orig_msg: any) {
    /*
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
    */
};

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
