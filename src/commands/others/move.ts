import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "move",
                group: "others",
                memberName: "move",
                description: "Move",
                examples: ["Move"],
                args: [
                    {
                        key: "user",
                        prompt: "User to move",
                        type: "user"
                    }
                ]
            }
        );
    }

    async run(msg: Commando.Message, args: any): Promise<any> {
        let testChannelId: string = "365844306331697153";
        let afkVoiceChannelId: string = "350370011967389697";
        let user: Discord.User = args.user;
        let channel: Discord.Channel = msg.client.channels.get(afkVoiceChannelId);
        let guildMember: Discord.GuildMember = msg.guild.members.get(user.id);
        guildMember.setVoiceChannel(channel);
        return undefined;
    }
};