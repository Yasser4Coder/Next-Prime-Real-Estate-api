/**
 * Minimal server for debugging 503 on Hostinger.
 * Set Entry file to "server.minimal.js" and redeploy.
 * Writes minimal-started.txt and deploy-info.txt in BOTH __dirname and process.cwd()
 * so you can find them even if Node runs from a different dir than public_html.
 * Search: find /home/$USER -name "minimal-started.txt" 2>/dev/null
 */
const fs = require('fs')
const path = require('path')

const PORT = parseInt(process.env.PORT, 10) || 3000
const info = [
  new Date().toISOString(),
  'PORT=' + PORT,
  'cwd=' + process.cwd(),
  'dirname=' + __dirname
].join('\n')

function writeMarker(dir) {
  try {
    fs.writeFileSync(path.join(dir, 'minimal-started.txt'), new Date().toISOString() + ' PORT=' + PORT, 'utf8')
    fs.writeFileSync(path.join(dir, 'deploy-info.txt'), info, 'utf8')
  } catch (e) {}
}
writeMarker(__dirname)
writeMarker(process.cwd())

const express = require('express')
const app = express()

app.get('/ping', (req, res) => res.json({ pong: true }))
app.get('/health', (req, res) => res.json({ ok: true, minimal: true, cwd: process.cwd(), port: PORT }))

app.listen(PORT, '0.0.0.0', () => {
  console.log('Minimal server on port ' + PORT + ' cwd=' + process.cwd())
})
