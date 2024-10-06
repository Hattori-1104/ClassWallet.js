import { Hono } from "hono"
import { cors } from "hono/cors"

// APIを作成
const api = new Hono()
api.use(cors())

// 各APIをインポート
import user from "./modules/user/routing"

// ルーティング
api.route("/user", user)

export { api }