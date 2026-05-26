const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const { connect, disconnect } = require('../config/testDb')

let cookie       // store auth cookie
let projectId    // store created project id
let sprintId     // store created sprint id
let workspaceId  // store workspace id

beforeAll(async () => {
  await connect()

  // Register and login
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Joel', email: 'joel@test.com', password: '123456' })

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'joel@test.com', password: '123456' })

  cookie = loginRes.headers['set-cookie']

  // Create workspace
  const wsRes = await request(app)
    .post('/api/workspaces')
    .set('Cookie', cookie)
    .send({ name: "Joel's Company" })

  workspaceId = wsRes.body._id

  // Create project
  const projRes = await request(app)
    .post('/api/projects')
    .set('Cookie', cookie)
    .send({ name: 'Test Project', workspaceId })

  projectId = projRes.body._id

  // Create sprint
  const sprintRes = await request(app)
    .post('/api/sprints')
    .set('Cookie', cookie)
    .send({
      name: 'Sprint 1',
      projectId,
      startDate: '2026-05-26',
      endDate: '2026-06-06',
      goal: 'Test sprint'
    })

  sprintId = sprintRes.body._id
})

afterAll(async () => await disconnect())

describe('Tasks — Create', () => {
  it('should create a task and return 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({
        title: 'Build login page',
        projectId,
        sprintId,
        priority: 'high'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.title).toBe('Build login page')
    expect(res.body.status).toBe('todo')
    expect(res.body.priority).toBe('high')
  })

  it('should not create task without title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ projectId, sprintId })

    expect(res.statusCode).toBe(500)
  })

  it('should not create task without auth', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', projectId, sprintId })

    expect(res.statusCode).toBe(401)
  })
})

describe('Tasks — Read', () => {
  it('should get tasks for a project', async () => {
    const res = await request(app)
      .get(`/api/tasks?projectId=${projectId}`)
      .set('Cookie', cookie)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('Tasks — Update', () => {
  let taskId

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Task to update', projectId, sprintId })
    taskId = res.body._id
  })

  it('should update task status', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', cookie)
      .send({ status: 'inprogress' })

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('inprogress')
  })

  it('should update task priority', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', cookie)
      .send({ priority: 'low' })

    expect(res.statusCode).toBe(200)
    expect(res.body.priority).toBe('low')
  })
})

describe('Tasks — Reorder', () => {
  let taskId

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Task to reorder', projectId, sprintId })
    taskId = res.body._id
  })

  it('should reorder task to new status and position', async () => {
    const res = await request(app)
      .patch('/api/tasks/reorder')
      .set('Cookie', cookie)
      .send({ taskId, newStatus: 'done', newOrder: 0 })

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('done')
  })
})

describe('Tasks — Delete', () => {
  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Task to delete', projectId, sprintId })

    const taskId = createRes.body._id

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Cookie', cookie)

    expect(deleteRes.statusCode).toBe(200)

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/tasks?projectId=${projectId}`)
      .set('Cookie', cookie)

    const found = getRes.body.find(t => t._id === taskId)
    expect(found).toBeUndefined()
  })
})