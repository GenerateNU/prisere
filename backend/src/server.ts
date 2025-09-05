import { db } from './db/index'
import usersRoute from './routes/users';
import { logger } from 'hono/logger';
import { Hono } from 'hono';

const app = new Hono();

// Global logger middleware
app.use('*', logger())

app.get('/', (c) => {
    return c.text("Hello!")
})

app.route('/users', usersRoute)

export default app;