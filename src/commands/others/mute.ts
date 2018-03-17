// tslint:disable:curly
import * as Commando from "discord.js-commando";
import * as Discord from "discord.js";

module.exports = class ReplyCommand extends Commando.Command {
    constructor(client: Commando.Client) {
        super(client,
            {
                name: "mute",
                group: "others",
                memberName: "mute",
                description: "mute a user",
                examples: ["mute @user"],
                args: [
                    {
                        key: "user",
                        prompt: "user to be muted",
                        type: "user"
                    }
                ]
            }
        );
    }

    async run(msg: Commando.Message, args: any): Promise<any> {
        let user: Discord.User = args.user;
        let guildMember: Discord.GuildMember =  msg.guild.members.get(user.id);
        if(guildMember.id === msg.author.id) return msg.reply("Você não pode se mutar.");
        if(!guildMember.voiceChannel) return msg.reply("Usuário precisa estar em um canal de voz para ser mutado.");
        if(guildMember.voiceChannel.muted) return msg.reply("Usuário já está mutado.");
        guildMember.setMute(true, "Fala muita merda.");
        return msg.reply("Usuário mutado.");
    }
};