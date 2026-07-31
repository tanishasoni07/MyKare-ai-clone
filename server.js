import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import crypto from 'node:crypto'

const app = express()
const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')
const dataDir = path.join(__dirname, 'data')
const messagesFile = path.join(dataDir, 'messages.json')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, '[]')

app.use(express.json())
app.use(express.static(dist))

app.post('/api/waitlist', (req, res) => {
  const email = String(req.body?.email || '').trim()
  if (!email || !email.includes('@')) return res.status(400).json({ ok: false, message: 'Please provide a valid email.' })
  console.log(`[waitlist] ${new Date().toISOString()} ${email}`)
  return res.status(201).json({ ok: true })
})

app.post('/api/contact', (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim()
  const message = String(req.body?.message || '').trim()
  if (!name || !email.includes('@') || !message) return res.status(400).json({ ok: false, message: 'Please complete all fields.' })
  const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'))
  messages.push({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() })
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2))
  console.log(`[contact] ${new Date().toISOString()} ${name} <${email}>`)
  return res.status(201).json({ ok: true, message: 'Message sent successfully.' })
})

app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
export default app

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Mykare AI running at http://localhost:${port}`))
}
