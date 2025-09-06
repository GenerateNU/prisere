import { Hono } from "hono";
import { describe, test, expect, beforeAll, } from "bun:test";
import { startTestApp } from "../setup-tests";

describe('Example', () => {
    let app: Hono;
    const requestBody = {
      firstName: "Zahra",
      lastName: "Wibisana",
      email: "zahra.w@gmail.com"
    };

    beforeAll(async () => {
      app = await startTestApp();
    });

    test('POST /users', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      expect(response.status).toBe(200)
    })
  })