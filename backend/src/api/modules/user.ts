import "dotenv/config"
import con from "./db_connection"
import { Result } from "./result"
import { FieldPacket, QueryResult, ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod"

// クエリによって返される
interface User extends RowDataPacket{
  id: number;
  email: string;
  tag: string;
  name: string;
  password_hash: string;
}

// テーブル名
const TABLE = "users";

// バリデーションスキーマ
const email_schema = z.string().min(10).max(200).email()
const tag_schema = z.string().min(2).max(200).startsWith("@").regex(/^@[0-9a-zA-Z_]+$/)

// すべて取得
async function getAll(): Promise<Result<User[]>> {
  const query = `SELECT * FROM ${TABLE};`
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
    query = `SELECT * FROM ${TABLE} WHERE email = :email;`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT * FROM ${TABLE} WHERE tag = :tag;`
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
  } catch (err: any) {
    return { type: "error", error: err}
  }
}

// 登録
async function register(user_data: User): Promise<Result> {
  const query = `INSERT INTO ${TABLE} VALUES (NULL, :email, :tag, :display_name, :password_hash)`
  const param = user_data
  try {
    const [results, fields]: [ResultSetHeader, FieldPacket[]] = await con.execute(query, param);

    // ユーザーidを返す
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
    query = `DELETE FROM ${TABLE} WHERE email = :email`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `DELETE FROM ${TABLE} WHERE tag = :tag`
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
async function checkExistance(user_identifier: string): Promise<Result<{existance: boolean}>> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${TABLE} WHERE email = :email LIMIT 1`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${TABLE} WHERE tag = :tag LIMIT 1`
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
async function verify(user_identifier: string, password_hash: string): Promise<Result<{verified: boolean}>> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${TABLE} WHERE email = :email AND password_hash = :password_hash LIMIT 1`
    param = { email: user_identifier, password_hash: password_hash }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT 1 FROM ${TABLE} WHERE tag = :tag AND password_hash = :password_hash LIMIT 1`
    param = { tag: user_identifier, password_hash: password_hash }
  }
  // 例外処理
  else {
    return { type: "error", error: { message: "invalid user data" } }
  }
  try {
    interface Existance extends RowDataPacket {string: number}
    const [results, fields]: [Existance[], FieldPacket[]] = await con.execute<Existance[]>(query, param)
    return { type: "success", payload: { verified: Boolean(results.length) } }
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

// メールアドレスまたはユーザータグからユーザーIDを取得
// ユーザーの存在はすでに確認できている前提で実行される
async function getUserID(user_identifier: string): Promise<Result<{id: number}>> {
  let query: string;
  let param: object;
  // メールアドレスの場合
  if ( email_schema.safeParse(user_identifier).success ) {
    query = `SELECT id FROM ${TABLE} WHERE email = :email LIMIT 1`
    param = { email: user_identifier }
  } 
  // ユーザータグの場合
  else if ( tag_schema.safeParse(user_identifier).success ) {
    query = `SELECT id FROM ${TABLE} WHERE tag = :tag LIMIT 1`
    param = { tag: user_identifier }
  }
  // 例外処理
  else {
    return { type: "error", error: { message: "invalid user identifier" } }
  }
  try {
    // ユーザーのIDのみのデータセットを返す
    interface UserID extends RowDataPacket { id: number }
    const [results, fields]: [UserID[], FieldPacket[]] = await con.execute<(UserID)[]>(query, param)
    if (results.length === 0) throw { message: "invalid user identifier" }
    return { type: "success", payload: {id: results[0].id}} 
  } catch (err: any) {
    return { type: "error", error: err }
  }
}

export default { getAll, get, register, _delete, checkExistance, verify, getUserID }
