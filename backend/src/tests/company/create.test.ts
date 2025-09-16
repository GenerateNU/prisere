

/*
 * Missing: 
 *  name -- throws error
 *  last quickbooks time -- should work (value is optional)
 * 
 * Name < 1 character -- throws error
 * Types:
 *  Throws error if name is not a string
 *  Throws error if last quickbooks time is not a Date
 * 
 * Test that this returns the correct response body type (CreateCompanyResponseSchema)
 * 
 * Test that a duplicate company is not created
 * 
 */


import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from 'pg-mem';

describe('Example', () => {
    let app: Hono;
    let backup: IBackup;
    const requestBody = {
        name: "Zahra",
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app
        backup = testAppData.backup
    });

    afterEach(async () => {
        backup.restore()
    });

    test('POST /companies', async () => {
        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        expect(response.status).toBe(201)
    })
})