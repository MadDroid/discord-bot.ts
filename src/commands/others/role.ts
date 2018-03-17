// tslint:disable:curly
import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "role",
                group: "others",
                memberName: "role",
                description: "",
                examples: [""]
            }
        );
    }

    async run(msg: Discord.Message, args: any): Promise<any> {
        let guild: Discord.Guild = msg.guild;
        let guildMember: Discord.GuildMember = msg.member;
        let highRoleCalculatedPosition: number = 0;
        let highRole: Discord.Role;
        guild.roles.forEach(item => {
            if (item.calculatedPosition > highRoleCalculatedPosition) {
                highRole = item;
                highRoleCalculatedPosition = item.calculatedPosition;
            }
        });
        console.log(highRole);
        return undefined;
    }
};