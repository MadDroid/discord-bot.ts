// tslint:disable:max-line-length
import * as Commando from "discord.js-commando";

import {Games, IGame} from "../../games";
import * as Time from "../../util";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "prox",
                group: "csgo",
                memberName: "prox",
                description: "Próximo jogo de um time.",
                examples: ["prox sk gaming"],
                args: [
                    {
                        key: "time",
                        prompt: "Time para próximo jogo.",
                        type: "string"
                    }
                ]
            }
        );
    }

    async run(msg: Commando.Message, args: any): Promise<any> {
        var games: IGame[] = Games.instance.getGames;
        const team: string = args.time;
        let reply: string = "";

        if (games && games.length > 0) {
            games.forEach((item) => {
                if (item.teamA.toLowerCase() === team.toLowerCase() || item.teamB.toLowerCase() === team.toLowerCase()) {
                    let gameDate: Date = new Date(1e3 * item.matchDate);
                    reply += `Próximo jogo: ${item.teamA} x ${item.teamB} ${Time.formatDate(gameDate)} ${Time.formatTime(gameDate, false)} \n`;
                }
            }, this);
        }
        return msg.code("cpp", reply === "" ? "Sem próximos jogos ou time não encontrado" : reply);
    }
};

