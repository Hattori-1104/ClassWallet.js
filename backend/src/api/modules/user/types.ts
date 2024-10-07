import { RowDataPacket } from "mysql2"
import { z } from "zod"

const EmailSchema = z.string().min(10).max(200).email()
const TagSchema = z.string().min(2).max(100).startsWith("@").regex(/^@[0-9a-zA-Z_]+$/)
const NameSchema = z.string().min(1).max(100)
const PasswordHashSchema = z.string().length(64).regex(/^[0-9a-f]+$/)
const PasswordSaltSchema = z.string().length(8).regex(/^[0-9a-f]+$/)

const UserIdentifierSchema = z.union([EmailSchema, TagSchema])

const UserSchema = z.object({
  id: z.number(),
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: PasswordHashSchema,
  password_salt: PasswordSaltSchema,
  updated_at: z.number()
})

const RequestUserSchema = z.object({
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: PasswordHashSchema,
  password_salt: PasswordSaltSchema,
})

interface User extends RowDataPacket {
  id: number,
  email: string,
  tag: string,
  name: string,
  password_hash: string,
  password_salt: string,
  updated_at: number,
}

const SessionUserSchema = z.object({
  id: z.number(),
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  updated_at: z.number(),
  validity_time: z.number()
})
type SessionUser = z.infer<typeof SessionUserSchema>

type RequestUser = z.infer<typeof RequestUserSchema>

export {
  User, RequestUser, SessionUser,
  UserSchema, RequestUserSchema, SessionUserSchema,
  EmailSchema, TagSchema, NameSchema, PasswordHashSchema, PasswordSaltSchema, UserIdentifierSchema
}