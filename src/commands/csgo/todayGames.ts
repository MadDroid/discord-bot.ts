import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";
import { Games, IGame } from "../../games";
import * as Time from "../../util";


module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Discord.Client) {
        super(client,
            {
                name: "jogos",
                group: "csgo",
                memberName: "jogos",
                description: "Próximo jogo",
                examples: ["jogos"]
            }
        );
    }

    async run(msg: Commando.Message, args: any): Promise<any> {
        let games: IGame[] = Games.instance.getGames;

        if (games && games.length > 0) {
            let reply: string = "";

            let fields: {}[] = [];

            games.forEach( (item: IGame) => {
                let now: number = new Date().setHours(0, 0, 0, 0);
                let tempDate: number = new Date(1e3 * item.matchDate).setHours(0, 0, 0, 0);

                if (now === tempDate) {
                    let gameDate: Date = new Date(1e3 * item.matchDate);

                    fields.push({
                        name: `${item.teamA} x ${item.teamB}`,
                        value: Time.formatTime(gameDate, false)
                    });

                    // tslint:disable-next-line:max-line-length
                    reply += `Próximo jogo: ${item.teamA} x ${item.teamB} ${Time.formatDate(gameDate)} ${Time.formatTime(gameDate, false)} \n`;
                }
            }, this);

            let embed: {} = {
                "title": "**Próximos jogos para hoje**",
                "url": "https://draft5.gg/",
                "color": 25255,
                "timestamp": new Date,
                "fields": fields
            };

            // tslint:disable:comment-format
            // Sempre retornar algo.
            if (fields.length !== 0) {
                return msg.embed(embed);
            } else if (fields.length > 25) {
                return msg.code("cpp", reply);
            } else {
                return msg.code("cpp", "Sem próximos jogos para hoje.");
            }
        }
    }
};

