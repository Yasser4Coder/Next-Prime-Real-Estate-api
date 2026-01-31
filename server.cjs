/**
 * CommonJS entry for hosts that use require() (e.g. Hostinger lsnode).
 * Set Hostinger "Application startup file" to: server.cjs
 */
import('./index.js').catch((err) => {
  console.error(err)
  process.exit(1)
})
