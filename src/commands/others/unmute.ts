// tslint:disable:curly
import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "unmute",
                group: "others",
                memberName: "unmute",
                description: "unmute user",
                examples: ["unmute @user"],
                args: [
                    {
                        key: "user",
                        prompt: "user to be unmuted",
                        type: "user"
                    }
                ]
            }
        );
    }

    async run(msg: Discord.Message, args: any): Promise<any> {
        let user: Discord.User = args.user;
        let guildMember: Discord.GuildMember =  msg.guild.members.get(user.id);
        if(guildMember.id === msg.author.id) return msg.reply("Você não pode se desmutar.");
        if(!guildMember.voiceChannel) return msg.reply("Usuário precisa estar em um canal de voz para ser desmutado.");
        if(guildMember.voiceChannel.muted) return msg.reply("Usuário não está mutado.");
        guildMember.setMute(false, "Fala muita merda.");
        return msg.reply("Usuário desmutado.");
    }
};