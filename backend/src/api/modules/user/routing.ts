import { Hono } from "hono"
import * as Methods from "./methods"
import { RequestUser, RequestUserSchema } from "./types"

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

export default api