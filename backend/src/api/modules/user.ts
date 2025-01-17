import "dotenv/config"
import con from "./db_connection"
import { Result } from "./result"
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod"

// クエリによって返される
interface User extends RowDataPacket{
  email: string;
  tag: string;
  display_name: string;
  password_hash: string;
  authorized: boolean;
}

// テーブル名
const table = "users";

// バリデーションスキーマ
const email_schema = z.string().min(10).max(200).email()
const tag_schema = z.string().min(2).max(200).startsWith("@").regex(/^@[0-9a-zA-Z_]+$/)

// すべて取得
async function getAll(): Promise<Result<User[]>> {
  const query = `SELECT * FROM ${table};`
  const param = {}
  try {
    const [results, fields]: [User[], FieldPacket[]] = await con.execute<User[]>(query, param)
    return { type: "success", payload: results }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

// 取得
async function get(user_identifier: string): Promise<Result<User>> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT * FROM ${table} WHERE email = :email;`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT * FROM ${table} WHERE tag = :tag;`
    param = { tag: user_identifier }
  }
  // 例外処理
  else return { type: "error", error: { message: "invalid user identifier" } }
  // クエリ
  try {
    const [results, fields]: [User[], FieldPacket[]] = await con.execute<User[]>(query, param);
    // ※返される値は配列だが、要素の数は0または1しか起こりえない
    if (results.length == 0) throw { message: "requested user does not exists" }
    return { type: "success", payload: results[0]};
    // variable as unknown as NewType
  } catch (err: any) {
    return { type: "error", error: err}
  }
}

// 登録
async function register(user_data: User): Promise<Result<void>> {
  const query = `INSERT INTO ${table} VALUES (:email, :tag, :display_name, :password_hash, :authorized)`
  const param = user_data
  try {
    const [results, fields]: [ResultSetHeader, FieldPacket[]] = await con.execute(query, param);
    // クエリの成功・失敗のみ返す
    return { type: "success" }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

// 削除
async function _delete(user_identifier: string): Promise<Result> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `DELETE FROM ${table} WHERE email = :email`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `DELETE FROM ${table} WHERE tag = :tag`
    param = { tag: user_identifier }
  }
  // 例外処理
  else {
    return { type: "error", error: { message: "invalid user identifier" } }
  }
  // クエリ
  try {
    const [results, fields]: [ResultSetHeader, FieldPacket[]] = await con.execute(query, param);
    // クエリの成功・失敗のみ返す
    if (results.affectedRows == 0) throw { message: "requested user does not exists" }
    return { type: "success" }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

// 存在の確認
async function checkExistance(user_identifier: string): Promise<Result> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${table} WHERE email = :email LIMIT 1`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${table} WHERE tag = :tag LIMIT 1`
    param = { tag: user_identifier }
  }
  // 例外処理
  else {
    return { type: "error", error: { message: "invalid user identifier" } }
  }
  try {
    interface Existance extends RowDataPacket {string: number}
    const [results, fields]: [Existance[], FieldPacket[]] = await con.execute<Existance[]>(query, param)
    return { type: "success", payload: { existance: Boolean(results.length) } }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

// 認証
async function verify(user_identifier: string, password_hash: string): Promise<Result> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${table} WHERE email = :email AND password_hash = :password_hash LIMIT 1`
    param = { email: user_identifier, password_hash: password_hash }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${table} WHERE tag = :tag AND password_hash = :password_hash LIMIT 1`
    param = { tag: user_identifier, password_hash: password_hash }
  }
  // 例外処理
  else {
    return { type: "error", error: { message: "invalid user data" } }
  }
  try {
    interface Existance extends RowDataPacket {string: number}
    const [results, fields]: [Existance[], FieldPacket[]] = await con.execute<Existance[]>(query, param)
    return { type: "success", payload: { verify: Boolean(results.length) } }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

export default { getAll, get, register, _delete, checkExistance, verify }


