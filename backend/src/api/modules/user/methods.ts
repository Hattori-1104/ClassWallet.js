import { FieldPacket, ResultSetHeader } from "mysql2"
import con from "../database_connection"
import { MethodResult } from "../result"
import { RequestUser } from "./types"

const TABLE = "users"

// 登録
async function register(user_data: RequestUser): Promise<MethodResult<{id: number}>> {
  const query = `INSERT INTO ${TABLE} VALUES (NULL, :email, :tag, :name, :password_hash, :password_salt, :updated_at)`
  const param = { ...user_data, updated_at: Date.now() }
  // クエリ
  try {
    const [results, fields]: [ResultSetHeader, FieldPacket[]] = await con.execute(query, param);
    const id = results.insertId
    // ユーザーidを返す
    return { type: "success", payload: { id: id } }
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message } }
  }
}

export { register }