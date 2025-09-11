import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from 'pg-mem';

describe('Example', () => {
    let app: Hono;
    let backup: IBackup;
    const requestBody = {
        firstName: "Zahra",
        lastName: "Wibisana",
        email: "zahra.w@gmail.com"
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app
        backup = testAppData.backup
    });

    afterEach(async () => {
        backup.restore()
    });

    test('POST /users', async () => {
        const response = await app.request('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201)
    })
})