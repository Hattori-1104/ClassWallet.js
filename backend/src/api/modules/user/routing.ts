import { Hono } from "hono"
import * as Methods from "./methods"
import { PasswordHashSchema, RequestUser, RequestUserSchema, UserIdentifierSchema } from "./types"

const api = new Hono()

api.post('/register', async (c) => {
  let user_data
  try {
    user_data = await c.req.json()
  } catch (err: any) {
    return c.json({ type: "error", error: { code: "invalid_request", message: "Malformed request" }}, 400)
  }
  // リクエストのバリデーション
  if (!RequestUserSchema.safeParse(user_data).success) {
    return c.json({ type: "error", error: { code: "invalid_request", message: "Malformed request" }}, 400)
  }
  // エラー出ない確信もってやってる
  let result = await Methods.register(user_data as RequestUser)
  return c.json(result, result.type == "success" ? 200 : 400)
})

api.get('verify/password/:user_identifier/:password_hash', async (c) => {
  let password_hash = c.req.param("password_hash")
  let user_identifier = c.req.param("user_identifier")
  if (!PasswordHashSchema.safeParse(password_hash).success || !UserIdentifierSchema.safeParse(user_identifier).success) return c.json({ type: "error", error: { code: "invalid_request", message: "Malformed request" }}, 400)
  let result = await Methods.verifyByPassword(user_identifier, password_hash)
  return c.json(result, result.type == "success" ? 200 : 400)
})

api.get('verify/token/:token', async (c) => {
  let token = c.req.param("token")
  let result = await Methods.verifyByToken(token)
  return c.json(result, result.type == "success" ? 200 : 400)
})

api.get('gen_token/:id', async (c) => {
  let id = Number(c.req.param("id"))
  let result = await Methods.genToken(id)
  return c.json(result, result.type == "success" ? 200 : 400)
})

export default api