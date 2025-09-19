import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from 'pg-mem';

describe('Example', () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app
        backup = testAppData.backup
    });

    afterEach(async () => {
        backup.restore()
    });

    test('POST /companies - All Fields Given - String Date 2', async () => {
        const requestBody = {
            name: "Cool Company",
            lastQuickBooksImportTime: "2025-12-25T09:30:00.000Z"
            //new Date(2025, 11, 25, 9, 30, 0, 0) // December 25, 2025, 09:30:00.000
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe(requestBody.lastQuickBooksImportTime);
    })

    test('POST /companies - All Fields Given - String Date 1', async () => {
        const requestBody = {
            name: "Cool Company",
            lastQuickBooksImportTime: "2025-12-25 9:30:00.000Z"
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe("2025-12-25T09:30:00.000Z");
    })

    test('POST /companies - All Fields Given, Date Object', async () => {
        const requestBody = {
            name: "Cool Company",
            lastQuickBooksImportTime: new Date(2025, 11, 25, 9, 30, 0, 0) // December 25, 2025, 09:30:00.000
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe("2025-12-25T09:30:00.000Z");
    })

    test('POST /companies - Optional fields not included', async () => {
        const requestBody = {
            name: "Cool Company",
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe(null);
    })

    test('POST /companies - Name is empty', async () => {
        const requestBody = {
            name: "",
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(400);
    })

    test('POST /companies - Name not given', async () => {
        const requestBody = {
            lastQuickBooksImportTime: new Date(2025, 11, 25, 9, 30, 0, 0)
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(400);
    })

    test('POST /companies - Unsupported date type', async () => {
        const requestBody = {
            name: "Cool Company",
            lastQuickBooksImportTime: "Tuesday"
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(400);
    })

    test('POST /companies - Unsupported date type 2', async () => {
        const requestBody = {
            name: "Cool Company",
            lastQuickBooksImportTime: 1234
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(400);
    })

    test('POST /companies - Unsupported name type', async () => {
        const requestBody = {
            name: 1,
        };
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(400);
    })
})