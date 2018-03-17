// tslint:disable-next-line:comment-format
// tslint:disable:comment-format
// Import
import {Settings} from "./settings";
import {Games} from "./games";
import * as Time from "./util";

let done: boolean = false;

// TODO: Mudar timer para colocar um intervalo personalizado.

export class Timer {
    static setTimer(): void {
        let lastChecked: Date = new Date(Settings.instance.getSettings.game.lastChecked);
        let now: Date = new Date();

        let diff: number = Math.abs(now.getTime() - lastChecked.getTime());

        // 1 hour
        let timeout: number = 1e3 * 60 * 60;

        // 1 min
        // let timeout = 1000 * 60;

        if(diff < timeout && !done) {
            timeout -= diff;
            done = true;
            console.log(Time.getDateTime() + " - timeout set to " + timeout / 1000 + "s");
        } else {
            Games.instance.fetchGames();
        }

        setTimeout(this.setTimer.bind(this), timeout);
    }
}