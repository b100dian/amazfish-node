/** 
 * Script to analyze sleep data between 14-20 feb 2021
 * 
 * The outcomes from Zepp, GadgetBridge and amazfish** are included.
 * (** amazfish patched with https://github.com/b100dian/harbour-amazfish/tree/sleep)
 */

let sqlite3 = require('sqlite3'),
    start_dt = '2021-02-13T12:00',
    end_dt = '2021-02-21T12:00';

const febDay14_21Results = {
    zepp: { 
        light: [454,436,477,347,406,431,595],
        deep: [45,51,49,44,24,61,75]
    },
    gadgetBridge: {
        ligth: [422,517,474,396,401,522,485],
        deep: [101,108,145,80,66,76,102]
    }
};

type Row = { timestamp_dt: string, raw_kind: number, raw_intensity: number };

(function(){
    let d: Date, // current day, sleep detection runs from midday to midday
        light = 0,
        deep = 0,
        curDate: Date;

    let temp_sleep = 0,
        temp_sleep_ts = 0,
        in_sleep = false;

    function processEntry(_error: Error, {timestamp_dt, raw_kind, raw_intensity} : Row) {
        curDate = new Date(timestamp_dt.substr(0, 10)); // YYYY-MM-DD
        // d = d || new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - 1);
        d = d || curDate;
        let t = new Date(timestamp_dt);

        if (curDate.getTime() != d.getTime() && t.getHours() > 12) { //date change
            // Save the current values
            console.log(curDate, Math.floor(light/60) + "h" + light %60, "light:", light, "deep:", deep);

            d = curDate;
            light = 0;
            deep = 0;
            temp_sleep = 0;
            temp_sleep_ts = 0;
            in_sleep = false;
        }

        let activity = raw_kind,
            intensity = raw_intensity;

        if (activity == 123 || (in_sleep == false && activity)) {
            in_sleep = true;
            temp_sleep_ts = t.getTime();
        }

        if (in_sleep && (activity == 124 || (in_sleep && ((activity & 112) != 112)))) {
            in_sleep = false;

            let delta_seconds = (t.getTime() - temp_sleep_ts)/1000;
            temp_sleep = delta_seconds/60;

            if (intensity > 0 || temp_sleep > 1) {
                light += temp_sleep;
            } else {
                deep += temp_sleep;
            }
            temp_sleep_ts = t.getTime();
            temp_sleep = 0;
        }

        if (in_sleep && ((activity == 112 /*&& activity != 115*/) || activity == 121 || activity == 122)) {

            let delta_seconds = (t.getTime() - temp_sleep_ts)/1000;
            temp_sleep = delta_seconds/60;

            if (intensity > 0 || temp_sleep > 1) {
                light += temp_sleep;
            } else {
                deep += temp_sleep;
            }
            temp_sleep_ts = t.getTime();
            temp_sleep = 0;
        }
    }
    
    function dbOpen() {
        db.each(`select 
            id,
            timestamp,
            timestamp_dt,
            device_id,
            user_id,
            raw_intensity,
            steps,
            raw_kind,
            heartrate
    
            from mi_band_activity
            where timestamp_dt > '${start_dt}' and timestamp_dt < '${end_dt}'
            order by timestamp asc
        `, {
    
        }, processEntry)
    }
    let db = new sqlite3.Database('data/amazfish.kexi', sqlite3.OPEN_READONLY, dbOpen);
    
    

})();


