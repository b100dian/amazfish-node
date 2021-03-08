/**
 * Script to analyze sleep data between 14-20 feb 2021
 *
 * The outcomes from Zepp, GadgetBridge and amazfish** are included.
 * (** amazfish patched with https://github.com/b100dian/harbour-amazfish/tree/sleep)
 */

import { processEntry as processAmazfishSleep } from "./src/amazfish-sleep-branch.js";
import sqlite3 from "sqlite3"

let start_dt = '2021-02-13T12:00',
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

    }, processAmazfishSleep);

}
let db = new sqlite3.Database('data/amazfish.kexi', sqlite3.OPEN_READONLY, dbOpen);
