import { message } from "blessed";

const fs = require('fs');
const path = require('path');

var players_to_verified: string[] = [];
var serverShutdown = false;
var serverStarted = false;

//save variables from config file
var token = GetConfig("token");
var chanID = GetConfig("chanID");
var botEnabled = GetConfig("botEnabled");
var enableServerStartStopMessages = GetConfig("enableServerStartStopMessages");
var enablePlayerLog = GetConfig("enablePlayerLog");
var playerLogChanID = GetConfig("playerLogChanID");

console.log("Starting Discord bridge");

// Discord Bot Requirements
const Discord = require('discord.js');
var bot = new Discord.Client({disableEveryone: true, intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages]});
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

// Bot Events
// Events related to discord.js
//sets bot status and sends "[Server]: Bridge Started" to discord
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    console.log("Discord bridge has started.");
    if (!serverStarted){
        SendToDiscordEvent("Server Started");
        serverStarted = true;
    }
    if (enableServerStartStopMessages) {
        SendToDiscordEvent("Bridge Started");
    }
    bot.user.setPresence({activity: {name: 'Sacrificing Goats'}, status: 'online'});
});

process.on('message', (ev) =>{
    if (ev.bridgeEvent == 'Join') {
        SendToDiscordEvent(ev.playerName + " has joined the server");
        if (enablePlayerLog) SendToPlayerLog(ev.playerName + " has joined the server");
    }
    else if (ev.bridgeEvent == 'Leave') {
        SendToDiscordEvent(ev.playerName + " has left the server");
        if (enablePlayerLog) SendToPlayerLog(ev.playerName + " has left the server");
    }
    else if (ev.bridgeEvent == 'gameMessage') {
        SendToDiscord(ev.message, ev.playerName);
    }
    else if (ev.bridgeEvent == 'deathMessage') {
        SendToDiscordEvent(ev.deathMessage);
    }
    else if (ev.bridgeEvent == 'serverShutdown') {
        serverShutdown = true;
        if (enableServerStartStopMessages) SendToDiscordEvent("Server Shutting Down");
        bot.destroy();
        process.exit(0);
    }
});

//sends messages from bridge channel to minecraft server
bot.on('messageCreate', (msg: {channel: {id: string;}; author: {bot: string | boolean; username: string; }; content: string; }) => {
    if (botEnabled && msg.channel.id == chanID && msg.author.bot != true && msg.content.startsWith("X") != true) {
        if (!process.send) return;
        process.send({bridgeEvent: 'discordMessage', orig_msg: msg, playerName: msg.author.username, content: msg.content});
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
function SendToDiscordEvent(message: string) {
    if (botEnabled == true) {
        const chan = bot.channels.cache.get(chanID);
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

function SendToPlayerLog(message: string) {
    if (botEnabled) {
        const chan = bot.channels.cache.get(playerLogChanID);
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
    if (botEnabled) {
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
        case "enablePlayerLog":
            return config.enablePlayerLog;
        case "enableDeathMessages":
            return config.enableDeathMessages;
        case "playerLogChanID":
            return config.playerLogChanID;
        default:
            return null;
    }
}
