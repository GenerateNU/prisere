/**
 * 
 * - id that exists
 * - id that does not exist
 * - no id
 * - wrong type id (not string)
 * - 
 * 
 */

import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from 'pg-mem';

describe('Example', () => {
    let app: Hono;
    let backup: IBackup;
    let createdCompanyId: String;
    const requestBody = {
        name: "Test Company"
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app
        backup = testAppData.backup

        const response = await app.request('/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        const body = await response.json();
        createdCompanyId = body.id;
        console.log("Created ID: ", createdCompanyId)
    });

    afterEach(async () => {
        backup.restore()
    });

    test('GET /companies/:id - id that exists', async () => {
        console.log("Getting company from created ID:", createdCompanyId)
        const response = await app.request(`/companies/${createdCompanyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.name).toBe(requestBody.name)
    })

    test('GET /companies/:id - id that does not exist', async () => {
        const response = await app.request('/companies/999', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        console.log("ID that doesnt exist RESPONSE:")
        console.log(response)
        console.log("Body:", await response.text());
        expect(response.status).toBe(404)
    })

    test('GET /companies/:id - no id', async () => {
        const response = await app.request('/companies/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        // console.log("No ID RESPONSE:")
        // console.log("Body:", await response.text());
        expect([400, 404]).toContain(response.status)
    })

    test('GET /companies/:id - wrong type id (not string)', async () => {
        // If your route expects a string, try passing an object or array
        // Here, we use a non-numeric string if your id is numeric
        const response = await app.request('/companies/abc', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        console.log("Wrong ID type RESPONSE:")
        console.log(response)
        console.log("Body:", await response.text());
        expect([400, 404]).toContain(response.status)
    })

    test('GET /companies', async () => {
        const response = await app.request('/companies/1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        console.log("RESPONSE:")
        console.log(response)
        console.log("Body:", await response.text());
        
        expect(response.status).toBe(200)
    })
})