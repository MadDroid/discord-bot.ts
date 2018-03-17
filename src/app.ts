// tslint:disable:curly
// tslint:disable:comment-format
// tslint:disable:max-line-length
import * as config from "../botconfig.json";

import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";
import * as path from "path";
import { Games, IGame, IScore } from "./games";
//import { Timer } from "./timer";
import { Reminder, IReminder } from "./reminder";
import * as Time from "./util";
import * as fs from "fs";

Games.instance.activeTimeout();

const client: Commando.Client = new Commando.Client({
    owner: (<any>config).ownerId,
    commandPrefix: "!",
    disableEveryone: true
});

client
    .on("ready", () => {
        console.log(`${Time.getDateTime()} - Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
        client.user.setGame("!help");
        activateReminders();
    })
    .on("error", console.error)
    .on("warn", console.warn)
    .on("disconnect", () => {
        console.warn(Time.getDateTime() + " - Disconnected!");
    })
    .on("reconnecting", () => {
        console.warn(Time.getDateTime() + " - Reconnecting...");
    });

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerGroups([
        ["csgo", "Counter Strike Global Offensive"],
        ["others", "Other commands"],
        //["media", "Media commands"]
    ])
    .registerCommandsIn(path.join(__dirname, "commands"));

client.login((<any>config).botToken);

Reminder.instance.loadReminders();

function activateReminders(): void {
    Reminder.instance.on("reminder", async (time: string, reminder: IReminder) => {
        Games.instance.getSingleMatch(reminder.game.matchId, async (game: IGame) => {
            let channel: Commando.Channel = client.channels.get(reminder.channelId);
            let stream: string = "";

            reminder.game = game;

            if (reminder.game.stream.streamPlatform === "Twitch") stream = "http://www.twitch.tv/" + reminder.game.stream.streamChannel;
            if (reminder.game.stream.streamPlatform === "YouTubeEmbed") stream = "https://www.youtube.com/watch?v=" + reminder.game.stream.streamChannel;

            let embed: IEmbed = {
                title: `${reminder.game.teamA} x ${reminder.game.teamB}`,
                description: "",
                url: stream,
                fields: [],
                timestamp: new Date(1e3 * reminder.game.matchDate)
            };

            reminder.game.scores.forEach((item: IScore) => {
                embed.fields.push({
                    name: item.map,
                    value: `${item.scoreA} x ${item.scoreB}`,
                    inline: true
                });
            }, this);

            let message: Discord.Message;

            switch (time) {
                case "30":
                    embed.description = "Jogo começa em 30 minutos.";
                    message = await channel.send({ embed: embed });
                    break;
                case "10":
                    embed.description = "Jogo começa em 10 minutos.";
                    //message.delete();
                    message = await channel.send({ embed: embed });
                    break;
                case "0":
                    embed.description = "Jogo está começando.";
                    //message.delete();
                    message = await channel.send({ embed: embed });
                    let pinnedMessage: Discord.Message = await message.pin();
                    updateGame(reminder, pinnedMessage);
                    break;
                default:
                    break;
            }
        });
    });
}

function updateGame(reminder: IReminder, message: Discord.Message): void {
    Games.instance.getSingleMatch(reminder.game.matchId, (game: IGame) => {
        let isGameOver: boolean = game.isOver === 1 && game.isFinished === 1;
        // Atualizar mensagem caso o placar mude.
        let oldEmbed: Discord.MessageEmbed = message.embeds[0];
        let fields: {}[] = [];

        game.scores.forEach(item => {
            fields.push({
                name: item.map,
                value: `${item.scoreA} x ${item.scoreB}`
            });
        });

        let newEmbed: IEmbed = {
            title: oldEmbed.title,
            description: oldEmbed.description,
            url: oldEmbed.url,
            fields: fields,
            timestamp: new Date(1e3 * game.matchDate)
        };

        if (!isGameOver) {
            newEmbed.description = "Ao vivo.";
            message.edit({ embed: newEmbed });
            setTimeout(() => { updateGame(reminder, message); }, 1e3 * 60 * 2);
        } else {
            newEmbed.description = "Finalizado";
            message.edit({ embed: newEmbed });
        }
    });
}

interface IEmbed {
    title: string;
    description: string;
    url: string;
    fields: {}[];
    timestamp: Date;
}
