import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import 'dotenv/config'

// アプリを作成
const app = new Hono()
app.use(logger())

app.get('/', (c) => {
  return c.text('this is rest api server')
})

// apiのインポート
import { api } from './api/routing'
app.route('/api', api)

// サーブ
const port: any = process.env.SERVER_PORT || 3000
serve({
  fetch: app.fetch,
  port
})
console.log(`Server is running on port ${port}`)

