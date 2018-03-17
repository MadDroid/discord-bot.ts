// tslint:disable:max-line-length
import * as Commando from "discord.js-commando";

import { Games, IGame } from "../../games";
import { Reminder } from "../../reminder";
import * as Time from "../../util";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "lemb",
                group: "csgo",
                memberName: "lemb",
                description: "Define um lembrete para uma equipe.",
                examples: ["lemb sk gaming"],
                args: [
                    {
                        key: "equipe",
                        prompt: "Equipe para colocar o lembrete.",
                        type: "string"
                    }
                ]
            }
        );
    }

    async run(msg: Commando.Message, args: any): Promise<any> {
        let team: string = args.equipe;
        let response: any = Reminder.instance.setReminder(team, msg.channel);

        switch (response) {
            case "já definido":
                return msg.code("cpp", "Lembrete já definido para " + team);
            case undefined:
                return msg.code("cpp", "Time não encontrado ou sem próximo jogo.");
            default:
                let teamA: string = response.teamA;
                let teamB: string = response.teamB;

                let gameDate: Date = new Date(1e3 * response.matchDate);

                return msg.code("cpp", `Lembrete definido para ${team}. \nPróximo jogo: ${teamA} x ${teamB} ${Time.formatDate(gameDate)} ${Time.formatTime(gameDate, false)}`);
        }
    }
};