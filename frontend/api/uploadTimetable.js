/******************************************************************
 * uploadTimetable.js
 * ---------------------------------------------------------------
 * parseTimetable(file: File)  ->  Promise<ParsedRow[]>
 *
 * ParsedRow = { Day, Time, Room, Course }
 *
 * ‑ Requires `xlsx` ( SheetJS ) :  npm i xlsx
 * ‑ Designed for the FAST timetable layout you showed in the screenshot
 ******************************************************************/

import * as XLSX from 'xlsx';

// ──────────────────────────────────────────────────────────────────────────
// Small helpers
// ──────────────────────────────────────────────────────────────────────────
const TIME_REGEX = /(\d{1,2}):(\d{2})(?:\.|)(am|pm)\.?/i;
const DELTA = 10;                       // 80‑minute lecture / 8 cells  → 10‑min slots
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n) => (n < 10 ? '0' + n : n);

/** Spread merged‑cell values across the individual cells (SheetJS keeps only the top‑left). */
function unmerge(sheet) {
    if (!sheet['!merges']) return;
    sheet['!merges'].forEach((rng) => {
        const ref = XLSX.utils.encode_cell(rng.s);
        const val = sheet[ref] ? sheet[ref].v : undefined;
        for (let R = rng.s.r; R <= rng.e.r; ++R) {
            for (let C = rng.s.c; C <= rng.e.c; ++C) {
                const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
                if (!sheet[cellAddr]) sheet[cellAddr] = { t: 's', v: val };
            }
        }
    });
}

/** Clean course title like the Python version */
function cleanCourseTitle(str) {
    return str.replace(/\((.*?)\)/g, (_, inner) => {
        return `(${inner.replace(/-/g, ' ').replace(/,([^ ])/g, ', $1')})`;
    }).trim();
}

/** Extract section e.g. "(BCS‑1A)" */
const extractSection = (course) => {
    const m = course.match(/\(.*?\)/);
    return m ? m[0] : null;
};

/** Build time headers starting at startTime with 10‑minute increments */
function buildTimeHeaders(startTime, count) {
    const headers = ['Day', 'Room'];
    let t = startTime;                                   // Date object
    for (let i = 0; i < count - 2; i++) {
        headers.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        t = new Date(t.getTime() + DELTA * 60_000);
    }
    return headers;
}

// ──────────────────────────────────────────────────────────────────────────
//  Main exported function
// ──────────────────────────────────────────────────────────────────────────
/**
 * Parse FAST timetable (.xlsx) → JSON rows [{Day, Time, Room, Course}]
 * @param {File} file  – browser File object (xlsx)
 */
export async function parseTimetable(file) {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    unmerge(ws);                                           // fill merged cells

    // Convert whole sheet to array‑of‑arrays for easier indexing
    const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

    // ── 1. Find title row & batches row (rows 0,1 in your file) ───────────
    const title = grid[0]?.[0] ?? 'FAST Timetable';

    // ── 2. Time‑series row is row index 3 (0‑based) in the file you showed ─
    const timeRow = grid[3];
    const timeSeriesRange = timeRow.length;
    let firstTimeCell = String(timeRow[2] || '');
    let match = firstTimeCell.match(TIME_REGEX);

    let startDate = new Date();
    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        startDate.setHours(hour, minute, 0, 0);
    } else {
        startDate.setHours(8, 0, 0, 0);                      // default 08:00 AM
    }

    // Build table headers identical to Python
    const headers = buildTimeHeaders(startDate, timeSeriesRange);

    // ── 3. Slice the timetable body (from row 3 downwards, minus last col) ─
    const bodyRows = grid.slice(3).map((r) => r.slice(0, timeSeriesRange));

    // First two cols are Day & Room; forward‑fill Day column like pandas
    let currentDay = '';
    const records = [];

    bodyRows.forEach((row) => {
        if (!row.length) return;

        // ─── detect a real weekday in the 1st cell ──────────────────────────
        const firstCell = (row[0] || '').trim();

        if (firstCell) {
            // try to match against known weekdays (case‑insensitive, prefixes OK)
            const match = DAYS.find(
                (d) => firstCell.toLowerCase().startsWith(d.slice(0, 3).toLowerCase())
            );
            if (match) currentDay = match;        // update only on real day names
            // otherwise ignore fillers like "—"
        }

        const room = row[1] || '';
        const day = currentDay || '';          // may still be empty for header gaps

        for (let c = 2; c < row.length; c++) {
            const course = row[c];
            if (!course) continue;                         // skip empty cells

            // Times are in the header array we built earlier
            const timeLabel = headers[c];

            // ⬇️ NEW: only push once we have a real weekday
            if (!day || day === '—') continue;              // ignore header filler rows

            records.push({
                Day: day,
                Time: timeLabel,
                Room: room,
                Course: cleanCourseTitle(course),
            });
        }

    });



    // ── 4. Post‑processing: combine consecutive slots (optional) ──────────
    // Group by Day/Room/Course and make "HH:MM - HH:MM" ranges
    const combined = [];
    records.sort((a, b) =>
        DAYS.indexOf(a.Day) - DAYS.indexOf(b.Day) ||
        a.Room.localeCompare(b.Room) ||
        a.Course.localeCompare(b.Course) ||
        new Date(`1970/01/01 ${a.Time}`) - new Date(`1970/01/01 ${b.Time}`)
    );

    let last = null;
    for (const rec of records) {
        if (
            last &&
            rec.Day === last.Day &&
            rec.Room === last.Room &&
            rec.Course === last.Course
        ) {
            // extend time range
            last._end = new Date(new Date(`1970/01/01 ${rec.Time}`));
        } else {
            // push previous
            if (last) {
                combined.push({
                    Day: last.Day,
                    Time: `${last.Time} - ${last._endStr || last.TimeEnd}`,
                    Room: last.Room,
                    Course: last.Course,
                });
            }
            // start new
            const start = new Date(`1970/01/01 ${rec.Time}`);
            last = {
                ...rec,
                _start: start,
                _end: new Date(start),
            };
        }
        last._endStr = last._end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        last.TimeEnd = last._endStr;
    }
    // push final
    if (last) {
        combined.push({
            Day: last.Day,
            Time: `${last.Time} - ${last._endStr || last.TimeEnd}`,
            Room: last.Room,
            Course: last.Course,
        });
    }

    return combined;
}
