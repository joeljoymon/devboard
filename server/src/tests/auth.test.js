const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')              // we'll create this in a moment
const { connect, disconnect } = require('../config/testDb')

beforeAll(async () => await connect())
afterAll(async () => await disconnect())

// Clear users between tests so they don't interfere
afterEach(async () => {
  const { User } = require('../models/User')
  // safer to just delete all users after each test
  await mongoose.connection.collection('users').deleteMany({})
})

describe('Auth — Register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Joel Joymon', email: 'joel@test.com', password: '123456' })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.email).toBe('joel@test.com')
    expect(res.body).not.toHaveProperty('password')  // password never returned
  })

  it('should not register with duplicate email', async () => {
    // Register once
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Joel', email: 'joel@test.com', password: '123456' })

    // Try again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Joel2', email: 'joel@test.com', password: '123456' })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Email already registered')
  })

  it('should not register without required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'joel@test.com' })  // missing name and password

    expect(res.statusCode).toBe(500)
  })
})

describe('Auth — Login', () => {
  beforeEach(async () => {
    // Create a user to login with
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Joel', email: 'joel@test.com', password: '123456' })
  })

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joel@test.com', password: '123456' })

    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe('joel@test.com')
    // Cookie should be set
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joel@test.com', password: 'wrongpassword' })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })

  it('should not login with wrong email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: '123456' })

    expect(res.statusCode).toBe(401)
  })

  it('should login with rememberMe true — cookie maxAge 30 days', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joel@test.com', password: '123456', rememberMe: true })

    expect(res.statusCode).toBe(200)
    const cookie = res.headers['set-cookie'][0]
    // 30 days in seconds = 2592000
    expect(cookie).toContain('Max-Age=2592000')
  })
})

describe('Auth — Protected route', () => {
  it('should block /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(401)
  })

  it('should return user on /api/auth/me with valid token', async () => {
    // Register + login to get cookie
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Joel', email: 'joel@test.com', password: '123456' })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joel@test.com', password: '123456' })

    const cookie = loginRes.headers['set-cookie']

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie)   // send the cookie back

    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe('joel@test.com')
  })
})

describe('Auth — Logout', () => {
  it('should clear cookie on logout', async () => {
  const res = await request(app).post('/api/auth/logout')
  expect(res.statusCode).toBe(200)
  const cookie = res.headers['set-cookie']?.[0] || ''
  // Either format means cookie is being cleared
  const isCookieCleared =
    cookie.includes('Max-Age=0') ||
    cookie.includes('Expires=Thu, 01 Jan 1970') ||
    cookie.includes('token=;')
  expect(isCookieCleared).toBe(true)
})
})