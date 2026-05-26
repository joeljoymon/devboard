const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, '')

app.use(cors({ origin: clientUrl, credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth',       require('./routes/authRoutes'))
app.use('/api/workspaces', require('./routes/workspaceRoutes'))
app.use('/api/projects',   require('./routes/projectRoutes'))
app.use('/api/sprints',    require('./routes/sprintRoutes'))
app.use('/api/tasks',      require('./routes/taskRoutes'))

app.get('/api/health', (req, res) => res.json({ message: 'Server is running' }))

module.exports = app