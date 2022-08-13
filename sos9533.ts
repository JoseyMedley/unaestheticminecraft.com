//  _______  _______  _______   _____   _______  ______   ______
// (  ____ \(  ___  )(  ____ \ / ___ \ (  ____ \/ ___  \ / ___  \
// | (    \/| (   ) || (    \/( (   ) )| (    \/\/   \  \\/   \  \
// | (_____ | |   | || (_____ ( (___) || (____     ___) /   ___) /
// (_____  )| |   | |(_____  ) \____  |(_____ \   (___ (   (___ (
//       ) || |   | |      ) |      ) |      ) )      ) \      ) \
// /\____) || (___) |/\____) |/\____) )/\____) )/\___/  //\___/  /
// \_______)(_______)\_______)\______/ \______/ \______/ \______/

/*

LICENSE-------------------------------------------------------------------------

Copyright (c) 2022 sos9533, mdisprgm, job-gut


MIT LICENSE

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.


Can use it freely without any restrictions.
But don't change the code that makes "/sos9533scr" visible in-game.

--------------------------------------------------------------------------------

*/

//OP commands


//Device ban command (with out /) - For OP
const DeviceBanCommand = "de-ban";

//unban device command (with out /) - For OP
const DeviceUnbanCommand = "de-unban";



//Name ban command (with out /) - For OP
const NameBanCommand = "name-ban";

//unban name command (with out /) - For OP
const NameUnBanCommand = "name-unban";



//ban list command (with out /) - For OP
const ShowBanListCommand = "banlist";


//ban message
const BanTitle = "§l§f[ §cBAN §f]\n\n§cYou are banned from this server\n§7You can't join the server again";


/////////////////////////////////////////////////////////////////////


//use prefix
const UsePrefix: boolean = true;

//output style
//style A     <prefix> <Name> : message
//style B     <prefix> Name : message
//style C     [prefix] <Name> : message
//style D     [prefix] Name : message
let PrefixChatOutputType = "A";

//How to use prefix
//style A     OP(command) set user's prefix - /prefix (name) "(prefix)"
//style B     Any user can set their prefix - /prefix "(prefix)"
//style C     Any user can set their prefix by UI - /prefix
let PrefixCommandType: string = "A";

//prefix command (with out /)
const PrefixCommand = "prefix";

//prefix command explanation
const PrefixCommandExplanation = "give prefix to players";

//prefix max length  (not include 'How to use' style A)
const PrefixLength = 10;

//basic prefix - output this when someone don't have any prefix
const BasicPrefix = "§l§7Member";

/////////////////////////////////////////////////////////////////////


//dont change
const DEVICE_ID_FMT_LENGTH = 36;
const DEVICE_ID_FMT_LENGTH_ANDROID = 32;

/////////////////////////////////////////////////////////////////////

import { ActorWildcardCommandSelector, CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { Form } from "bdsx/bds/form";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { PlayerPermission, ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { CxxString, int32_t } from "bdsx/nativetype";
import { serverProperties } from "bdsx/serverproperties";
import { red, yellow } from "colors";
import * as fs from "fs";

const levelname = serverProperties["level-name"]

if (serverProperties["allow-cheats"] === "false") { throw (red("".white +"\n[".white + " sos9533scr".yellow + " ]".white + " ERROR / Allow Cheat is fasle!".red + " / CODE : ACF-sos9533scr / Need-Help? : https://open.kakao.com/o/sZscajId".gray)); };

const runCommand = bedrockServer.executeCommand;

//Dont remove
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
command.register("sos9533scr", "§r§l§fBDSX Basic Setting Plugin - §cCopyright (c) 2022 sos9533 §7MIT LICENSE§r", CommandPermissionLevel.Normal).overload((param, origin, output) => {
    if (origin.isServerCommandOrigin()) {
        output.success("");
    } else {
        runCommand(
            `tellraw "${origin.getName()}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§c${levelname} use sos9533scr BDSX plugin \nDownload : https://github.com/sos9533/bdsx-sos9533scr \nMade by sos9533"}]}`,
        );
        output.success("");
    };
}, {});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.info("[ " + "CUSTOM-sos9533scr".yellow + " ] " + `${levelname}`.red +` - Plugin Loading... 0/3`.gray)


/*
 * start plugin -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */if (!runCommand("sos9533scr").isSuccess()) { throw (red("".white +"\n[".white + " sos9533scr".yellow + " ]".white + " ERROR / Can't Find Important Code !".red + " / CODE : CFIC-sos9533scr / Need-Help? : https://open.kakao.com/o/sZscajId".gray)); }; /*
 */

const chin_json = "chin.json";

function makeFile(filepath: string, value = {}) {
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify(value));
        console.log("[", "sos9533scr".yellow, "]", `Made '${filepath}'`.gray, " - sos9533".green);
    }
}
function makeDir(dirname: string) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}
makeDir("./banDB");
makeDir("./DbanDB");



function leadZero(num: number, n: number) {
    var leadZero = "";
    let num2 = num.toString();
    if (num2.length < n) {
        for (var i = 0; i < n - num2.length; i++) leadZero += "0";
    }
    return leadZero + num;
}

function dateWithZero() {
    var d = new Date();
    return (
        d.getFullYear() +
        "-" +
        leadZero(d.getMonth() + 1, 2) +
        "-" +
        leadZero(d.getDate(), 2) +
        "-" +
        leadZero(d.getHours(), 2) +
        "-" +
        leadZero(d.getMinutes(), 2) +
        "-"
    );
}

console.info("[ " + "CUSTOM-sos9533scr".yellow + " ] " + `${levelname}`.red +` - Plugin Loading... 1/3`.gray)

export const playerList = new Map<NetworkIdentifier, string>();

const anticrasherkicktitle = "§l§f[ §7Kick §f]\n\n§cYou kicked";

function kick(target: NetworkIdentifier, message = anticrasherkicktitle) {
    bedrockServer.serverInstance.disconnectClient(target, message);
}

events.packetAfter(MinecraftPacketIds.Login).on((pkt, ni) => {
    const connreq = pkt.connreq;
    if (!connreq) return;

    const onlineops = bedrockServer.serverInstance.getPlayers().filter((p) => p.getPermissionLevel() === PlayerPermission.OPERATOR);
    const op_count = onlineops.length;

    const username = connreq.cert.getId();
    const deviceId = connreq.getDeviceId();
    let banlist = fs.readdirSync("./banDB/");
    if (banlist.includes(username)) {
        const getbantime = fs.readFileSync(`./banDB/${username}`);
        if (!getbantime) {
            kick(ni, BanTitle);
            for (let i = 0; i < op_count; i++) {
                onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Name Ban Player]`);
            }
            console.log(red(`[ sos9533scr ] ${username} tried connection [Name Ban Player]`));
            return CANCEL;
        }
        const ToString = String(getbantime);
        if (ToString == "null") {
            kick(ni, BanTitle);
            for (let i = 0; i < op_count; i++) {
                onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Name Ban Player]`);
            }
            console.log(red(`[ sos9533scr ] ${username} tried connection [Name Ban Player]`));
            return CANCEL;
        }

        const bandate = ToString.split(`-`);
        const year = Number(bandate[0]);
        const month = Number(bandate[1]);
        const day = Number(bandate[2]);
        const hours = Number(bandate[3]);
        const minutes = Number(bandate[4]);
        const banTime = `${year}Y ${month}M ${day}D ${hours}H ${minutes}M`;

        const Now = dateWithZero().split("-");
        const nyear = Number(Now[0]);
        const nmonth = Number(Now[1]);
        const nday = Number(Now[2]);
        const nhours = Number(Now[3]);
        const nminutes = Number(Now[4]);

        if (nyear >= year && nmonth >= month && nday >= day && nhours >= hours && nminutes >= minutes) {
            unbanenum.removeValues(username);
            fs.unlink(`./banDB/${username}`, (err) => {});
            return;
        }

        kick(ni, `${BanTitle}\n§fYour ban is expired on ${banTime}`);
        for (let i = 0; i < op_count; i++) {
            onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Name Ban Player]`);
        }
        console.log(red(`[ sos9533scr ] ${username} tried connection [Name Ban Player]`));
        return CANCEL;
    }

    const Dbanlist = fs.readdirSync("./DbanDB");
    if (Dbanlist.includes(deviceId)) {
        const getbantime = fs.readFileSync(`./DbanDB/${deviceId}`);
        if (!getbantime) {
            kick(ni, BanTitle);
            for (let i = 0; i < op_count; i++) {
                onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Device Ban Player] (${deviceId})`);
            }
            console.log(red(`[ sos9533scr ] ${username} tried connection [Device Ban Player] (${deviceId})`));
            return CANCEL;
        }
        const ToString = String(getbantime);
        if (ToString == "null") {
            kick(ni, BanTitle
);
            for (let i = 0; i < op_count; i++) {
                onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Device Ban Player] (${deviceId})`);
            }
            console.log(red(`[ sos9533scr ] ${username} tried connection [Device Ban Player] (${deviceId})`));
            return CANCEL;
        }

        const bandate = ToString.split(`-`);
        const year = Number(bandate[0]);
        const month = Number(bandate[1]);
        const day = Number(bandate[2]);
        const hours = Number(bandate[3]);
        const minutes = Number(bandate[4]);
        const banTime = `${year}Y ${month}M ${day}D ${hours}H ${minutes}M`;

        const Now = dateWithZero().split("-");
        const nyear = Number(Now[0]);
        const nmonth = Number(Now[1]);
        const nday = Number(Now[2]);
        const nhours = Number(Now[3]);
        const nminutes = Number(Now[4]);

        if (nyear >= year && nmonth >= month && nday >= day && nhours >= hours && nminutes >= minutes) {
            unbanenum.removeValues(deviceId);
            fs.unlink(`./DbanDB/${deviceId}`, (err) => {});
            return;
        }

        kick(ni, `${BanTitle}\n§fYour ban is expired on ${banTime}`);
        for (let i = 0; i < op_count; i++) {
            onlineops[i].sendMessage(`§l§f[ §esos9533scr §f]§f§l §c${username} tried connection [Device Ban Player] (${deviceId})`);
        }
        console.log(red(`[ sos9533scr ] ${username} tried connection [Device Ban Player] (${deviceId})`));
        return CANCEL;
    }
});

const cmd_unban = command.register(NameUnBanCommand, "Unban player", CommandPermissionLevel.Operator);

const unbanenum = command.softEnum("player", fs.readdirSync("./banDB/"));
const dunbanenum = command.softEnum("DeviceID", fs.readdirSync("./DbanDB/"));

cmd_unban.overload(
    (inputs, ni) => {
        const plname = ni.getName();

        if (plname === inputs.player) {
            runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§eGood Luck! :)"}]}`);
            return 0;
        }
        if (inputs.player === "") {
            runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §cError: Please type name here. Do not use @a @e @r @s @p"}]}`);
            return;
        }

        let banlist = fs.readdirSync("./banDB/");
        if (banlist.includes(inputs.player) === false) {
            if (ni.isServerCommandOrigin() === true) {
                console.log(red(`cant find ${inputs.player} \nuse '${ShowBanListCommand}'`));
                return CANCEL;
            } else {
                runCommand(
                    `tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l cant find ${inputs.player} \nuse '/${ShowBanListCommand}"}]}`,
                );
                return CANCEL;
            }
        } else {
            fs.unlink(`./banDB/${inputs.player}`, (err) => {});
            runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l ${inputs.player} unbanned"}]}`);
            console.log(yellow(`${plname} : ${inputs.player} unbanned`));
            unbanenum.removeValues(inputs.player);
        }
    },
    {
        player: unbanenum,
    },
);

command.register(NameBanCommand, "ban player by name", CommandPermissionLevel.Operator).overload(
    (inputs, corg) => {
        const plname = corg.getName();
        const Tname = inputs.player.getName();
        if (Tname === plname) {
            runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§cYou can't ban yourself"}]}`);
            return CANCEL;
        }

        if (!Tname) {
            runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §cError: Please type name here. Do not use @a @e @r @s @p"}]}`);
            return CANCEL;
        }

        let banlist = fs.readdirSync("./banDB/");
        if (banlist.includes(Tname)) {
            if (corg.isServerCommandOrigin()) {
                console.log(red(`${inputs.player.getName()} is already unbanned`));

                return CANCEL;
            } else {
                runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l ${inputs.player.getName()} is already unbanned"}]}`);
                return CANCEL;
            }
        }

        inputs.minutes = inputs.minutes ?? 0;

        const date = new Date();
        date.setMinutes(date.getMinutes() + inputs.minutes);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const time_title = `${year}Y ${month}M ${day}D ${hours}H ${minutes}T`;
        const time_log = `${year}-${month}-${day}-${hours}-${minutes}`;

        fs.writeFileSync(`./banDB/${Tname}`, time_log);

        console.log(yellow(`${plname} : ${Tname} is banned`));
        runCommand(`tellraw "${plname}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l ${Tname} is banned"}]}`);
        unbanenum.addValues(Tname);
        if (runCommand(`testfor "${Tname}"`).isSuccess()) {
            for (const pl of inputs.player.newResults(corg)) {
                const Ni = pl.getNetworkIdentifier();
                if (!inputs.minutes) {
                    kick(Ni, BanTitle);
                } else {
                    kick(Ni, `${BanTitle}\n§fYour ban is expired on ${time_title}`);
                }
                return CANCEL;
            }
        }
    },
    {
        player: PlayerCommandSelector,
        minutes: [int32_t, true],
    },
);

command.register(DeviceBanCommand,"ban player by deviceID",CommandPermissionLevel.Operator,)
    .overload(
        async (inputs, corg) => {
            const originName = corg.getName();
            const targetName = inputs.player.getName();

            if (targetName === originName) {
                runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§cYou can't ban yourself"}]}`);
                return;
            }

            if (!targetName) {
                runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §cError: Please type name here. Do not use @a @e @r @s @p"}]}`);
                return;
            }

            const target = corg.getLevel().getPlayerByName(targetName);
            if (!(target instanceof ServerPlayer)) return;
            const deviceId = target.deviceId;

            if (!runCommand(`testfor "${targetName}"`).isSuccess()) {
                runCommand(
                    `tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §cError: You can not use this command for offline player"}]}`,
                );
                if (corg.isServerCommandOrigin()) {
                    console.log(red("Error: You can not use this command for offline player"));
                }
                return;
            }

            inputs.minutes = inputs.minutes ?? 0;

            const bannedPlayers = fs.readdirSync("./banDB/");
            const bannedDevices = fs.readdirSync("./DbanDB/");
            if (bannedPlayers.includes(targetName) || bannedDevices.includes(deviceId)) {
                if (corg.isServerCommandOrigin()) {
                    console.log(red(`${targetName} is already banned`));
                    return;
                } else {
                    runCommand(
                        `tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l ${targetName} is already banned"}]}`,
                    );
                    return;
                }
            }

            const date = new Date();
            date.setMinutes(date.getMinutes() + inputs.minutes);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();

            const time_title = `${year}Y ${month}M ${day}D ${hours}H ${minutes}M`;
            const title_log = `${year}-${month}-${day}-${hours}-${minutes}`;

            fs.writeFileSync(`./DbanDB/${deviceId}`, title_log);

            runCommand(`execute "${originName}" ~ ~ ~ playsound random.orb ~ ~ ~ 1 1.5 1`);
            runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l Banned ${targetName} (${deviceId})"}]}`);
            console.log(yellow(`${originName} :  Banned ${targetName} (${deviceId})`));
            dunbanenum.addValues(deviceId);
            for (const player of inputs.player.newResults(corg)) {
                const ni = player.getNetworkIdentifier();
                if (!inputs.minutes) {
                    kick(ni, BanTitle);
                } else {
                    kick(ni, `${BanTitle}\n§fYour ban is expired on ${time_title}`);
                }
                return;
            }
        },
        {
            player: PlayerCommandSelector,
            minutes: [int32_t, true],
        },
    );

command.register(DeviceUnbanCommand, "Unban player device", CommandPermissionLevel.Operator).overload(
    (inputs, corg) => {
        const originName = corg.getName();

        if (inputs.DeviceID === "") {
            runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§cError: Please type device id here"}]}`);
            return;
        }
        if (inputs.DeviceID.length !== DEVICE_ID_FMT_LENGTH && inputs.DeviceID.length !== DEVICE_ID_FMT_LENGTH_ANDROID) {
            if (corg.isServerCommandOrigin()) {
                console.log(red("Error: This command needs only device ID (Example : aa12aaa3-abc4-567a-b890-12c34dc567e8"));
                return;
            } else {
                runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §cError: This command needs only device ID (Example : aa12aaa3-abc4-567a-b890-12c34dc567e8"}]}`);
                return;
            }
        }

        let Dbanlist = fs.readdirSync(`./DbanDB/`);
        if (!Dbanlist.includes(inputs.DeviceID)) {
            if (corg.isServerCommandOrigin()) {
                console.log(red(`${inputs.DeviceID} is already unbanned\nYou can see banlist using ${ShowBanListCommand}`));

                return;
            } else {
                runCommand(
                    `tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]  ${inputs.DeviceID} is already unbanned\n§cYou can see banlist using §e/banlist"}]}`,
                );
                return;
            }
        } else {
            fs.unlink(`./DbanDB/${inputs.DeviceID}`, (err) => {});
            runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l Unbanned device ID ${inputs.DeviceID}"}]}`);
            console.log(yellow(`${originName} : Unbanned device ID ${inputs.DeviceID}`));
            dunbanenum.removeValues(inputs.DeviceID);
        }
    },
    {
        DeviceID: dunbanenum,
    },
);

command.register(ShowBanListCommand, "Shows server ban list", CommandPermissionLevel.Operator).overload((asdf, corg) => {
    const plname = corg.getName();
    const banlist = fs.readdirSync("./banDB/", { withFileTypes: false });
    const Dbanlist = fs.readdirSync("./DbanDB/", { withFileTypes: false });
    if (corg.isServerCommandOrigin()) {
        console.log(yellow(`Name ban list : ${banlist}`));
        console.log(yellow(`Device ban list : ${Dbanlist}`));
    } else {
        runCommand(`tellraw ${plname} {"rawtext":[{"text":"Name ban list : ${banlist}"}]}`);
        runCommand(`tellraw ${plname} {"rawtext":[{"text":"Device ban list : ${Dbanlist}"}]}`);
    }
}, {});

console.info("[ " + "CUSTOM-sos9533scr".yellow + " ] " + `${levelname}`.red +` - Plugin Loading... 2/3`.gray)

makeFile(chin_json);

const ChinData = JSON.parse(fs.readFileSync(chin_json, "utf8"));
function saveChin() {
    fs.writeFileSync(chin_json, JSON.stringify(ChinData), "utf8");
}

if (UsePrefix === true) {
    events.packetBefore(MinecraftPacketIds.Text).on((ptr, ni, id) => {
        const actor = ni.getActor()!;
        const username = actor.getName();
        const message = ptr.message.replace(/"/gi, `''`);

        if (PrefixChatOutputType === "A") {
            runCommand(`tellraw @a {"rawtext":[{"text":"§l§f<${ChinData[username] || BasicPrefix}§f> §r<§r${ptr.name}§r>§r : ${message}"}]}`);
        } else if (PrefixChatOutputType === "B") {
            runCommand(`tellraw @a {"rawtext":[{"text":"§l§f<${ChinData[username] || BasicPrefix}§f> §r${ptr.name}§r : ${message}"}]}`);
        } else if (PrefixChatOutputType === "C") {
            runCommand(`tellraw @a {"rawtext":[{"text":"§l§f[${ChinData[username] || BasicPrefix}§f] §r<§r${ptr.name}§r>§r : ${message}"}]}`);
        } else if (PrefixChatOutputType === "D") {
            runCommand(`tellraw @a {"rawtext":[{"text":"§l§f[${ChinData[username] || BasicPrefix}§f] §r${ptr.name}§r : ${message}"}]}`);
        }
        return CANCEL;
    });

    if (PrefixCommandType === "A") {
        command.register(PrefixCommand, PrefixCommandExplanation, CommandPermissionLevel.Operator).overload(
            (params, origin, output) => {
                if (params.prefix !== undefined && params.target !== undefined) {
                    for (const player of params.target.newResults(origin, ServerPlayer)) {
                        const username = player.getName();
                        const target = params.target.newResults(origin)!;
                        const prefix = params.prefix;
                        const legnth = target.length;

                        for (let i = 0; i < legnth; i++) {
                            ChinData[username] = prefix;
                            saveChin();
                            runCommand(`playsound random.levelup @a[name="${origin.getName()}"]`);
                            runCommand(`tellraw "${origin.getName()}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§aProcessed successfully"}]}`);
                        }
                    }
                }
            },
            {
                target: ActorWildcardCommandSelector,
                prefix: CxxString,
            },
        );
    }

    if (PrefixCommandType === "B") {
        command.register(PrefixCommand, PrefixCommandExplanation, CommandPermissionLevel.Normal).overload(
            (params, origin, output) => {
                const originName = origin.getName();
                if (params.prefix !== undefined && origin.getEntity() !== undefined) {
                    const prefix = params.prefix;
                    if (prefix.length < PrefixLength) {
                        ChinData[originName] = prefix;
                        saveChin();
                        runCommand(`playsound random.levelup @a[name="${originName}"]`);
                        runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§aProcessed successfully"}]}`);
                    } else {
                        runCommand(`tellraw "${originName}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§cThe prefix is too long!"}]}`);
                        runCommand(`playsound random.orb @a[name="${originName}"]`);
                    }
                }
            },
            {
                prefix: CxxString,
            },
        );
    }

    if (PrefixCommandType === "C") {
        command.register(PrefixCommand, PrefixCommandExplanation).overload(async (params, origin, output) => {
            const actor = origin.getEntity();
            if (!actor?.isPlayer()) {
                console.log(red("You are the server console!"));
                return;
            }
            const ni = actor.getNetworkIdentifier();
            const username = actor.getName();

            const res = await Form.sendTo(ni, {
                type: "custom_form",
                title: "§l§0Prefix",
                content: [
                    {
                        type: "input",
                        text: `§l§7Type your prefix! §l§0[ §gsos9533scr §0]§r `,
                        default: BasicPrefix,
                    },
                ],
            });

            if (res === null) return;

            if (res[0]?.length < PrefixLength && username) {
                const prefix = res[0];
                ChinData[username] = prefix;
                saveChin();

                runCommand(`playsound random.levelup @a[name="${username}"]`);
                runCommand(`tellraw "${username}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§aProcessed successfully"}]}`);
            } else {
                runCommand(`tellraw "${username}" {"rawtext":[{"text":"§l§f[ §esos9533scr §f]§f§l §l§cThe prefix is too long!"}]}`);
                runCommand(`playsound random.orb @a[name="${username}"]`);
            }
        }, {});
    }
}


console.info("[ " + "CUSTOM-sos9533scr".yellow + " ] " + `${levelname}`.red +` - Plugin Loading... 3/3`.gray)
console.info("[ " + "CUSTOM-sos9533scr".yellow + " ] " + `${levelname}`.red +` - Plugin Loading Completed Successfully`.gray)
console.log("[ " + "CUSTOM-sos9533scr".yellow + " ] allocated", " - sos9533".green);
