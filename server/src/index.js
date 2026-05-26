const express = require('express')
const http = require('http')          // ← Node built-in
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const { initSocket } = require('./socket/socketManager')

dotenv.config()
connectDB()

const app = express()
const server = http.createServer(app)  // ← wrap Express in HTTP server

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
const authRoutes      = require('./routes/authRoutes')
const workspaceRoutes = require('./routes/workspaceRoutes')
const projectRoutes   = require('./routes/projectRoutes')
const sprintRoutes    = require('./routes/sprintRoutes')
const taskRoutes      = require('./routes/taskRoutes')

app.use('/api/auth',       authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects',   projectRoutes)
app.use('/api/sprints',    sprintRoutes)
app.use('/api/tasks',      taskRoutes)

app.get('/api/health', (req, res) => res.json({ message: 'Server is running' }))

// Init Socket.io — pass the HTTP server
initSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
// ← server.listen not app.listen — important