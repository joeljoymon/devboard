const request = require('supertest')
const express = require('express')

// Minimal express app for testing — no DB needed
const app = express()
app.use(express.json())
app.get('/api/health', (req, res) => res.json({ message: 'Server is running' }))

describe('Health Check', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Server is running')
  })
})