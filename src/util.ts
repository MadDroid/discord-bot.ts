// tslint:disable:comment-format
// tslint:disable:curly

// Date Time
export function formatDate(date: Date): string {
    let day: any = date.getDate();
    let month: any = date.getMonth() + 1;
    let year: any = date.getFullYear();

    let hour: number = date.getHours();
    let minutes: number = date.getMinutes();

    if (day.toString().length === 1)
        day = "0" + day;

    if (month.toString().length === 1)
        month = "0" + month;

    return day + "/" + month + "/" + year;
}

export function formatTime(date: Date, sec: boolean): string {
    let hour: any = date.getHours();
    let min: any = date.getMinutes();
    let seconds: any = date.getSeconds();

    if (hour.toString().length === 1)
        hour = "0" + hour;

    if (min.toString().length === 1)
        min = "0" + min;

    if (seconds.toString().length === 1)
        seconds = "0" + seconds;

    if (sec && sec === true)
        return hour + ":" + min + ":" + seconds;

    return hour + ":" + min;
}

export function getDateTime(): string {
    let date: Date = new Date();
    return formatDate(date) + " " + formatTime(date, true);
}

export function getDateDiff(matchDate: number): string {
    let _second: number = 1e3,
        _minute: number = 60 * _second,
        _hour: number = 60 * _minute,
        _day: number = 24 * _hour,
        now: any = new Date,
        distance: number = <any>new Date(1e3 * matchDate) - now;
    if (!(distance < 0)) {
        let days: number = Math.floor(distance / _day),
            hours: number = Math.floor(distance % _day / _hour),
            minutes: number = Math.floor(distance % _hour / _minute);
        Math.floor(distance % _minute / _second);
        // tslint:disable-next-line:max-line-length
        // tslint:disable-next-line:triple-equals
        return 0 == days ? hours + "h " + minutes + "m " : 0 == hours && 0 == days ? minutes + "m " : days + "d " + hours + "h " + minutes + "m ";
    }
}

export function isLive(matchDate: number): boolean {
    var currentDate: Date = new Date,
        md: Date = new Date(1e3 * matchDate);
    return md.getTime() < currentDate.getTime();
}
