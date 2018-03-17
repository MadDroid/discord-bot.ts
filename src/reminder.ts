// tslint:disable:curly
// tslint:disable:comment-format

import * as EventEmitter from "events";
import * as fs from "fs";
import * as Time from "./util";
import { Games, IGame } from "./games";
import * as Discord from "discord.js";

let timeouts: ITimeout[] = [];
let instance: Reminder;

const remindersPath: string = "data/reminders.json";

// TODO: Mudar channelId para array onde tem as ids de todos os canais que devem ser notificados.
// TODO: Atualização do jogo de 2 em 2 minutos.

class Reminder extends EventEmitter {
    public _team: string;
    constructor() {
        super();
        // Cria pasta data se não existir.
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("data");
            console.log(Time.getDateTime() + " - Diretório de dados criado.");
        }
        // Cria arquivo reminders.json se não existir.
        if (!fs.existsSync(remindersPath)) {
            fs.writeFileSync(remindersPath, "[]", "utf8");
            console.log(Time.getDateTime() + " - Arquivo de lembretes criado.");
        }

        this.checkEarlyMatch();
        this.updateReminderGame();
    }

    /**
     * Coloca um lembrete para um time.
     * @param team Time para qual colocar o lembrete.
     * @param channel Canal para qual o lembrete deve ser colocado.
     * @param reminder Lembrete anterior de time para ser subtituído.
     * @returns algo.
     */
    setReminder(team: string, channel: Discord.Channel, reminder?: IReminder): any {
        this._team = team.toLowerCase();
        // Carrega o array de lembretes.
        let reminders: IReminder[] = JSON.parse(fs.readFileSync(remindersPath, "utf8"));

        let lastMacthDate: number;

        // Verifica se foi passado um lembrete e cancela o mesmo caso for verdadeiro.
        if (reminder) {
            lastMacthDate = reminder.game.matchDate;
            this.cancelReminder(reminder.team);
        }

        // Retorna se o lembrete já foi definido para o time.
        if (timeouts.find(t => t.team === this._team))
            return "já definido";

        let games: IGame[] = Games.instance.getGames;

        let now: Date = new Date();

        let g: IGame;

        // Procura time pelo nome, se o jogo não terminou e se a data da partida é maior do que a data atual;
        if (lastMacthDate) {
            g = games.find(g => (
                (g.teamA.toLowerCase() === this._team) ||
                (g.teamB === this._team)) &&
                (g.isFinished === 0 && g.isOver === 0) &&
                (g.matchDate > lastMacthDate)
            );
        } else {
            g = games.find(g => (
                (g.teamA.toLowerCase() === this._team) ||
                (g.teamB === this._team)) &&
                (g.isFinished === 0 && g.isOver === 0) &&
                ((1e3 * g.matchDate) > new Date().getTime())
            );
        }

        reminders = JSON.parse(fs.readFileSync(remindersPath, "utf8"));

        // Se o jogo existir, ativa o lembrete.
        if (g) {
            // Cria o lembrete.
            let reminder: IReminder = {
                team: team,
                channelId: channel.id,
                teamId: g.teamA.toLocaleLowerCase() === team ? g.teamAId : g.teamBId,
                game: g
            };

            this.activateReminder(reminder);

            // Salva o lembrete se não foi salvo.
            if (!reminders.find(r => r.team === this._team)) {
                // Adiciona o lembrete na lista de lembretes.
                reminders.push(reminder);

                // Salva o array de lembretes.
                fs.writeFileSync(remindersPath, JSON.stringify(reminders));
            }

            return g;
        } else {
            // Retorna não definido se algum jogo ou o time não for encontrado.
            return undefined;
        }
    }

    // Ativa o lembrete.
    activateReminder(reminder: IReminder): void {
        let team: string = reminder.team;
        let game: IGame = reminder.game;

        if (timeouts.find(t => t.team === team))
            return;

        let matchDate: Date = new Date(1e3 * game.matchDate);
        let now: Date = new Date();

        let time: number = matchDate.getTime() - now.getTime();

        let second: number = 1e3;
        let minute: number = second * 60;

        let halfTimeout: NodeJS.Timer;
        let tenTimeout: NodeJS.Timer;
        let onTimeTimeout: NodeJS.Timer;

        if (time > minute * 30) {
            //console.log("reminder 30 set");
            // Define o timeout de 30 minutos.
            halfTimeout = setTimeout(() => {
                //console.log("reminder 30");
                this.emit("reminder", "30", reminder);
            }, time - minute * 30);
        }

        if (time > minute * 10) {
            //console.log("reminder 10 set");
            // Define o timeout de 10 minutos.
            tenTimeout = setTimeout(() => {
                //console.log("reminder 10");
                this.emit("reminder", "10", reminder);
            }, time - minute * 10);
        }

        if (time > 0) {
            //console.log("reminder 0 set");
            // Define o timeout de início da partida.
            onTimeTimeout = setTimeout(() => {
                //console.log("reminder 0");
                this.emit("reminder", "0", reminder);
                let prox: any = this.setReminder(team, new Discord.Channel(undefined, { id: reminder.channelId }), reminder);
            }, time);
        }

        let teamTimeout: ITimeout = {
            team: team,
            reminder: reminder,
            timeouts: {
                half: halfTimeout,
                ten: tenTimeout,
                onTime: onTimeTimeout
            }
        };

        // Coloca os timeouts no array para que possam ser cancelados caso solicitado.
        timeouts.push(teamTimeout);

        console.log(Time.getDateTime() + " - Lembrete definido para " + reminder.team + ": " + new Date(1e3 * reminder.game.matchDate));
    }

    // Remove o lembrete da lista.
    removeReminder(reminder: IReminder): void {
        let reminders: IReminder[] = JSON.parse(fs.readFileSync(remindersPath, "utf8"));
        // Encontra o index do lembrete baseado na id da partida.
        let index: number = reminders.findIndex(i => i.game.matchId === reminder.game.matchId);
        // Remove o lembrete da lista.
        reminders.splice(index, 1);

        console.log(Time.getDateTime() + " - Lembrete removido. MatchId: " + reminder.game.matchId);

        // Salva a lista.
        fs.writeFileSync(remindersPath, JSON.stringify(reminders));
    }

    // Carrega os lembretes.
    loadReminders(): void {
        let reminders: IReminder[] = JSON.parse(fs.readFileSync(remindersPath, "utf8"));
        reminders.forEach((item) => {
            this.activateReminder(item);
        }, this);
    }

    // Cancela o lembrete do o time solicitado.
    cancelReminder(team: string): string {
        let teamTimeout: ITimeout = timeouts.find(t => t.team === team.toLowerCase());
        let reminders: IReminder[] = JSON.parse(fs.readFileSync(remindersPath, "utf8"));
        if (teamTimeout) {
            clearTimeout(teamTimeout.timeouts.half);
            clearTimeout(teamTimeout.timeouts.ten);
            clearTimeout(teamTimeout.timeouts.onTime);
            let index: number = timeouts.findIndex(t => t.team === team.toLowerCase());
            timeouts.splice(index, 1);

            this.removeReminder(reminders.find(r => r.team === team.toLowerCase()));

            console.log(Time.getDateTime() + " - Lembrete para " + team + " cancelado.");

            return "cancelado";
        } else {
            return "sem timeouts";
        }
    }

    // Verifica se há partidas antes do timeout setado.
    checkEarlyMatch(): void {
        Games.instance.on("fetchGames", games => {
            timeouts.forEach((item) => {
                let game: IGame = games.find(i =>
                    (i.teamA.toLowerCase() === item.team || i.teamB.toLowerCase() === item.team) &&
                    (i.isOver === 0 && i.isFinished === 0) &&
                    (i.matchDate < item.reminder.game.matchDate));
                if (game) {
                    if (this.cancelReminder(item.team) === "cancelado")
                        this.setReminder(item.team, new Discord.Channel(undefined, { id: item.reminder.channelId }));
                }
            }, this);
        });
    }

    // Atualiza os jogos dos lebretes para os mais recentes.
    updateReminderGame(): void {
        Games.instance.on("fetchGames", (games: IGame[]) => {
            let reminders: IReminder[] = JSON.parse(fs.readFileSync(remindersPath, "utf8"));
            reminders.forEach((item: IReminder) => {
                item.game = games.find(g => g.matchId === item.game.matchId);
            });
            fs.writeFileSync(remindersPath, JSON.stringify(reminders));
        });
    }

    static get instance(): Reminder {
        if (!instance) instance = new Reminder();
        return instance;
    }
}

interface IReminder {
    team: string;
    teamId: number;
    channelId: string;
    game: IGame;
}

interface ITimeout {
    team: string;
    reminder: IReminder;
    timeouts: ITimeouts;
}

interface ITimeouts {
    half: NodeJS.Timer;
    ten: NodeJS.Timer;
    onTime: NodeJS.Timer;
}

export { Reminder, IReminder, ITimeout, ITimeouts };