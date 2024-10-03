import { Hono } from "hono"
import { cors } from "hono/cors"

// モジュールのインポート
import user from "./modules/user"

// APIを作成
const api = new Hono()
api.use("/*", cors())

// 各APIのインスタンスを作成
const user_api = new Hono()

// ルーティング
user_api.get("", async (c) => c.json(await user.getAll()))
user_api.get("/:user_identifier", async (c) => c.json(await user.get(c.req.param("user_identifier"))))
user_api.post("", async (c) => c.json(await user.register(await c.req.json())))
user_api.delete("/:user_identifier", async (c) => c.json(await user._delete(c.req.param("user_identifier"))))
user_api.get("/existance/:user_identifier", async (c) => c.json(await user.checkExistance(c.req.param("user_identifier"))))
user_api.get("/verify/:user_identifier/:password_hash", async (c) => c.json(await user.verify(c.req.param("user_identifier"), c.req.param("password_hash"))))

// ルーティングをさらにまとめる
api.route("/user", user_api)

export { api }