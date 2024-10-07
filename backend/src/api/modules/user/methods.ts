import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2"
import con from "../database_connection"
import { MethodResult } from "../result"
import { EmailSchema, RequestUser, SessionUser, SessionUserSchema, TagSchema, User } from "./types"
import * as jwt from "hono/jwt"
import { JWTPayload } from "hono/utils/jwt/types"
import { SignatureKey } from "hono/utils/jwt/jws"
import "dotenv/config"
import { TokenHeader } from "hono/utils/jwt/jwt"
import { tuple } from "zod"

const TABLE = "users"
const SECRET_KEY: SignatureKey = process.env.SECRET_KEY as string

// 登録
async function register(user_data: RequestUser): Promise<MethodResult<{id: number}>> {
  const query = `INSERT INTO ${TABLE} VALUES (NULL, :email, :tag, :name, :password_hash, :password_salt, :updated_at)`
  const param = { ...user_data, updated_at: Math.floor(Date.now() / 1000) }
  // クエリ
  try {
    const [results, fields]: [ResultSetHeader, FieldPacket[]] = await con.execute(query, param);
    const id = results.insertId
    // ユーザーidを返す
    return { type: "success", payload: { id } }
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message } }
  }
}

// パスワードで認証
async function verifyByPassword(user_identifier: User["email" | "tag"], password_hash: User["password_hash"]): Promise<MethodResult<{verified: boolean}>> {
  // ユーザー識別子はメールアドレスかユーザータグのどちらか
  let identifier_type: "email" | "tag"
  if (EmailSchema.safeParse(user_identifier).success) {
    identifier_type = "email"
  } else if (TagSchema.safeParse(user_identifier).success) {
    identifier_type = "tag"
  } else {
    return { type: "error", error: { code: "invalid_request", message: "Invalid user indentifier" }}
  }
  // クエリ文
  const query = `SELECT 1 FROM ${TABLE} WHERE ${identifier_type} = :${identifier_type} AND password_hash = :password_hash`
  const param = { [identifier_type]: user_identifier, password_hash }
  // クエリ
  try {
    const [[result], fields]: [({ '1': 1 } & RowDataPacket)[], FieldPacket[]] = await con.execute(query, param)
    return { type: "success", payload: { verified: Boolean(result) }}
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message }}
  }
}

async function genToken(id: User["id"]): Promise<MethodResult<{token: string}>> {
  // 現在時刻トークンを発行する
  const generatedDateTime = Math.floor(Date.now() / 1000)
  const query = `SELECT email, tag, name, updated_at FROM ${TABLE} WHERE id = :id`
  const param = { id }
  let result: ({ email: User["email"], tag: User["tag"], name: User["name"], updated_at: User["updated_at"] } & RowDataPacket)
  let fields: FieldPacket[]
  // クエリ
  try {
    [[result], fields] = await con.execute(query, param)
    if (!result) return { type: "error", error: { code: "invalid_request", message: "The user does not exist"}}
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message }}
  }
  // トークンの発行
  const validity_time = 24 * 60 * 60
  // const validity_time = 10
  const payload: SessionUser & JWTPayload = { id, ...result, updated_at: Math.floor(Date.now() / 1000,), validity_time }
  return { type: "success", payload: { token: await jwt.sign(payload, SECRET_KEY) }}
}

async function verifyByToken(token: string): Promise<MethodResult<{verified: true} | {verifed: false, message: string}>> {
  // 秘密鍵で認証
  try {
    await jwt.verify(token, SECRET_KEY)
  } catch (err: any) {
    return { type: "error", error: { code: "invalid_signature", message: "Invalid signature" } }
  }
  
  const {header, payload} = jwt.decode(token)
  // ペイロードをユーザーセッション情報へ
  let session: SessionUser
  try {
    session = SessionUserSchema.parse(payload)
  } catch (err: any) {
    return { type: "error", error: { code: "invalid_payload_format", message: "Invalid payload format" }}
  }
  // 有効期限の確認
  const nowDateTime = Math.floor(Date.now() / 1000)
  // 有効期限の範囲外
  if (!(session.updated_at <= nowDateTime && nowDateTime < (session.updated_at + session.validity_time))) return { type: "success", payload: { verifed: false, message: "Token has expired" } }
  // クエリ
  const query = `SELECT email, tag, name, updated_at FROM users WHERE id = :id`
  const param = { id: session.id }
  
  let result: ({ email: User["email"], tag: User["tag"], name: User["name"], updated_at: User["updated_at"] } & RowDataPacket)
  let fields: FieldPacket[]
  try {
    [[result], fields] = await con.execute(query, param)
    if (!result) return { type: "error", error: { code: "invalid_request", message: "The user does not exist"}}
  } catch (err: any) {
    return { type: "error", error: { code: "database_error", message: err.message }}
  }
  // セッションとデータベースをデータと比較
  if (session.updated_at < result.updated_at) return { type: "success", payload: { verifed: false, message: "Token is out of date" }}
  return { type: "success", payload: { verified: true }}
}

export { register, verifyByPassword, genToken, verifyByToken }