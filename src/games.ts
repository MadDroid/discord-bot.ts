// tslint:disable:comment-format
// Import
import * as fs from "fs";
import * as request from "request";
import * as EventEmitter from "events";
import * as Time from "./util";
import { Settings, ISettings } from "./settings";

// API
//const BaseApi = "http://draft5-v2.sa-east-1.elasticbeanstalk.com/api/v2/";
const BaseApi: string = "https://api.draft5.gg/api/v2/";
const futureMatch: string = "matches?filter[status]=0";

enum TimeoutTime {
    TwoMin = 1e3 * 60 * 2,
    FifteenMin = 1e3 * 60 * 15,
    OneHour = 1e3 * 60 * 60
}

let instance: Games;
let done: boolean = false;
let timeout: TimeoutTime = TimeoutTime.FifteenMin;

class Games extends EventEmitter {
    constructor() {
        super();
        // Cria pasta data se não existir.
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("data");
            console.log(Time.getDateTime() + " - Diretório de dados criado.");
        }
        // Create games.json if not exists.
        if (!fs.existsSync("data/games.json")) {
            fs.writeFileSync("data/games.json", "{}", "utf8");
            console.log(Time.getDateTime() + " - Arquivo de jogos criado.");
        }
    }

    activeTimeout(): void {
        let lastChecked: Date = new Date(Settings.instance.getSettings.game.lastChecked);
        let now: Date = new Date();

        let diff: number = Math.abs(now.getTime() - lastChecked.getTime());

        let out: number = timeout;

        if(diff < timeout && !done) {
            out -= diff;
            console.log(Time.getDateTime() + " - timeout set to " + out / 1000 + "s");
        } else {
            this.fetchGames();
        }
        done = true;

        setTimeout(this.activeTimeout.bind(this), out);
    }

    set timeout(value: TimeoutTime) {
        timeout = value;
    }

    get timeout(): TimeoutTime {
        return timeout;
    }

    get getGames(): IGame[] {
        return JSON.parse(fs.readFileSync("data/games.json", "utf8"));
    }

    fetchGames(callback?: Function): void {
        let Games: Games = this;
        request({
            uri: BaseApi + futureMatch,
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        }, (error, response, body) => {
            if (error) {
                console.log(error);
            } else {
                console.log(Time.getDateTime() + " - Jogos atualizados.");
                fs.writeFileSync("data/games.json", body, "utf8");
                let settings: ISettings = Settings.instance.getSettings;

                settings.game.lastChecked = new Date();

                Settings.instance.saveSettings(settings);

                Games.emit("fetchGames", JSON.parse(body));

                // tslint:disable-next-line:curly
                if (callback) callback(JSON.parse(body));
            }
        });
    }

    getSingleMatch(matchId: number, callback: Function): void {
        request({
            url: BaseApi + "matches/" + matchId,
            method: "GET"
        }, (error, response, body: string) => {
            if (error) {
                console.log(error);
            } else {
                callback(JSON.parse(body));
            }
        });
    }

    static get instance(): Games {
        // tslint:disable-next-line:curly
        if (!instance) instance = new Games();
        return instance;
    }
}
interface ICoverage {
    url: string;
    name: string;
}

interface IStream {
    streamName: string;
    streamChannel: string;
    streamLanguage: string;
    streamPlatform: string;
}

interface ISeries {
    scoreA: number;
    scoreB: number;
}

interface IScore {
    scoreA: number;
    scoreB: number;
    map: string;
    mapOrder: number;
}

interface IGame {
    teamA: string;
    teamACountry: string;
    teamAId: number;
    teamB: string;
    teamBCountry: string;
    teamBId: number;
    tournament: string;
    tournamentId: number;
    matchDate: number;
    matchId: number;
    isFinished: number;
    isOver: number;
    isTBA: number;
    isStreamed: number;
    isFeatured: number;
    coverage: ICoverage;
    stream: IStream;
    series: ISeries;
    scores: IScore[];
}

export { Games, IGame, ICoverage, IScore, ISeries, IStream, TimeoutTime };