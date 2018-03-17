// tslint:disable:comment-format

import * as fs from "fs";
import * as Time from "./util";

let instance: Settings;

class Settings {

    constructor() {
        // Create data folder if not exists.
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("data");
            console.log(Time.getDateTime() + " - Diretório de dados criado.");
        }

        // Create settings.json if not exists.
        if (!fs.existsSync("data/settings.json")) {
            fs.writeFileSync("data/settings.json", "{}", "utf8");
            console.log(Time.getDateTime() + " - Arquivo de configurações criado.");
        }

        let settings: ISettings = this.getSettings;

        // Check if settings object is empty.
        // If is, create the objects.
        if (Object.keys(settings).length === 0 && settings.constructor === Object) {
            settings.game = {
                lastChecked: new Date(0)
            };
            this.saveSettings(settings);
        }
    }

    get getSettings(): ISettings {
            return JSON.parse(fs.readFileSync("data/settings.json", "utf8"));
    }

    saveSettings(settings: ISettings): void {
        fs.writeFileSync("data/settings.json", JSON.stringify(settings));
    }

    static get instance(): Settings {
        // tslint:disable-next-line:curly
        if(!instance) instance = new Settings();
        return instance;
    }
}

interface ISettings {
    game: IGameSettings;
}

interface IGameSettings {
    lastChecked: Date;
}

export {Settings, ISettings};
