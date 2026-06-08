/**
 * Static build for GitHub Pages.
 * Temporarily hides dynamic route folders so Next.js skips
 * them during static export, then restores everything.
 */
import { renameSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const isWin = process.platform === 'win32'
const root  = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const next  = isWin
  ? resolve(root, 'node_modules', '.bin', 'next.cmd')
  : resolve(root, 'node_modules', '.bin', 'next')

// Folders to hide: [original, hidden]
const HIDE = [
  [resolve(root, 'app', 'api'),                             resolve(root, 'app', '_api')],
  [resolve(root, 'app', '(app)', 'plan', '[id]'),           resolve(root, 'app', '(app)', 'plan', '__id__')],
]

function restore() {
  for (const [orig, hidden] of HIDE) {
    if (existsSync(hidden)) {
      renameSync(hidden, orig)
      console.log(`✓ Restored ${orig.split(/[\\/]app[\\/]/)[1]}`)
    }
  }
}

process.on('exit', restore)
process.on('SIGINT',  () => { restore(); process.exit(1) })
process.on('SIGTERM', () => { restore(); process.exit(1) })

try {
  for (const [orig, hidden] of HIDE) {
    if (existsSync(orig)) {
      renameSync(orig, hidden)
      console.log(`→ Hidden ${orig.split(/[\\/]app[\\/]/)[1]}`)
    }
  }

  execSync(`"${next}" build`, {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env },
    shell: true,
  })
} finally {
  restore()
}
