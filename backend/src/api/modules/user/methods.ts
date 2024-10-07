import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2"
import con from "../database_connection"
import { MethodResult } from "../result"
import { EmailSchema, RequestUser, RequestUserSchema, ResultUser, TagSchema } from "./types"
import { Result } from "hono/router"

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

// パスワードで認証
async function verifyByPassword(user_identifier: RequestUser["email" | "tag"], password_hash: RequestUser["password_hash"]): Promise<MethodResult<{verified: boolean}>> {
  // ユーザー識別子はメールアドレスかユーザータグのどちらか
  let identifier_type: "email" | "tag"
  if (EmailSchema.safeParse(user_identifier).success) {
    identifier_type = "email"
  } else if (TagSchema.safeParse(user_identifier).success) {
    identifier_type = "tag"
  } else {
    return { type: "error", error: { code: "invalid_request", message: "Malformed request" }}
  }
  // クエリ文
  const query = `SELECT 1 FROM ${TABLE} WHERE ${identifier_type} = :${identifier_type} AND password_hash = :password_hash`
  const param = { [identifier_type]: user_identifier, password_hash }
  // クエリ
  try {
    const [results, fields]: [({ '1': 1 } & RowDataPacket)[], FieldPacket[]] = await con.execute(query, param)
    console.log(results)
    return { type: "success", payload: { verified: Boolean(results.length) }}
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message }}
  }
}


export { register, verifyByPassword }