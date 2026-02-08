export const DEMO_REPOS = [
  { name: 'Next.js', owner: 'vercel', repo: 'next.js', branch: 'canary' },
  { name: 'React', owner: 'facebook', repo: 'react', branch: 'main' },
  { name: 'Express', owner: 'expressjs', repo: 'express', branch: 'master' },
]

export const FILE_PATTERNS = {
  auth: ['auth', 'login', 'session', 'jwt', 'token', 'password', 'credential'],
  payment: ['payment', 'stripe', 'checkout', 'billing', 'subscription', 'invoice'],
  api: ['api', 'endpoint', 'route', 'controller', 'handler', 'request', 'response'],
  database: ['database', 'schema', 'migration', 'model', 'prisma', 'sql', 'query'],
  testing: ['test', 'spec', 'mock', '__tests__', 'e2e', 'unit', 'integration'],
  config: ['config', 'env', 'settings', '.config', 'setup', 'dotenv']
}

export const CATEGORY_KEYWORDS = {
  authentication: FILE_PATTERNS.auth,
  payments: FILE_PATTERNS.payment,
  api: FILE_PATTERNS.api,
  database: FILE_PATTERNS.database,
  testing: FILE_PATTERNS.testing,
  config: FILE_PATTERNS.config
}
