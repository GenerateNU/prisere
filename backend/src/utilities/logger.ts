import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = './log';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_FILE = join(LOG_DIR, `${NODE_ENV}.log`);

if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
}

const stripAnsi = (str: string): string => {
    return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
};

export const logMessageToFile = (message: string, ...rest: string[]) => {
    const timestamp = new Date().toISOString();
    const cleanMessage = stripAnsi(message);
    const cleanRest = rest.map(stripAnsi);
    const fullMessage = `[${timestamp}] ${cleanMessage}${cleanRest.length ? ' ' + cleanRest.join(' ') : ''}\n`;
    
    appendFile(LOG_FILE, fullMessage, 'utf8', (err) => {
        if (err) console.error('Failed to write to log:', err);
    });
};

export const logObjectToFile = (data: object) => {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${data}\n`;

    appendFile(LOG_FILE, fullMessage, 'utf8', (err) => {
        if (err) console.error('Failed to write to log:', err);
    });
}