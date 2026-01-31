/**
 * Minimal server for debugging 503 on Hostinger.
 * No DB, no routes, no multer – only Express + listen.
 * In Hostinger set Entry file to "server.minimal.js" and redeploy.
 * If https://your-api/ping returns {"pong":true}, Hostinger is fine and the crash is in the full app.
 */
const express = require('express')
const app = express()
const PORT = parseInt(process.env.PORT, 10) || 3000

app.get('/ping', (req, res) => res.json({ pong: true }))
app.get('/health', (req, res) => res.json({ ok: true, minimal: true }))

app.listen(PORT, '0.0.0.0', () => {
  console.log('Minimal server running on port ' + PORT)
})
