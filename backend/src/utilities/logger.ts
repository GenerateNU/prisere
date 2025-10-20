/* eslint-disable no-control-regex */
import { appendFile, existsSync, mkdirSync } from "fs";
import { join } from "path";

const LOG_DIR = "./log";
const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_FILE = join(LOG_DIR, `${NODE_ENV}.log`);

if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
}

// remove all ansi character used for making the string look pretty in the console
// they will just mess up the text in the log
const stripAnsi = (str: string): string => {
    return str.replace(/\x1b\[[0-9;]*m/g, "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
};

// Implementation of a PrintFunc (https://hono.dev/docs/middleware/builtin/logger#printfunc)
export const logMessageToFile = (message: string, ...rest: string[]) => {
    const timestamp = new Date().toISOString();
    const cleanMessage = stripAnsi(message);
    const cleanRest = rest.map(stripAnsi);
    const fullMessage = `[${timestamp}] ${cleanMessage}${cleanRest.length ? " " + cleanRest.join(" ") : ""}\n`;

    appendFile(LOG_FILE, fullMessage, "utf8", (err) => {
        if (err) {
            console.error("Failed to write to log:", err);
        }
    });
};

// more generalized logger
export const logObjectToFile = (data: object) => {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${data}\n`;

    appendFile(LOG_FILE, fullMessage, "utf8", (err) => {
        if (err) {
            console.error("Failed to write to log:", err);
        }
    });
};
