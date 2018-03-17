import {Games} from "../Games";

Games.instance.fetchGames((games) => {
    console.log(games);
});