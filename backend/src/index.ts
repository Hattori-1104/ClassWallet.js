import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'

// アプリを作成
const app = new Hono()
app.use("/*", cors())
app.get('/', (c) => {
  return c.text('this is rest api server')
})

// apiのインポート
import { api } from "./api/routing"
app.route("/api", api)

// サーブ
const port: any = process.env.SERVER_PORT || 3000
serve({
  fetch: app.fetch,
  port
})
console.log(`Server is running on port ${port}`)

