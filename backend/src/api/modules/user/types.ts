import { RowDataPacket } from "mysql2"
import { z } from "zod"

const EmailSchema = z.string().min(10).max(200).email()
const TagSchema = z.string().min(2).max(100).startsWith("@").regex(/^@[0-9a-zA-Z_]+$/)
const NameSchema = z.string().min(1).max(100)
const PasswordHashSchema = z.string().length(64)
const PasswordSaltScheam = z.string().length(8)

const ResultUserSchema = z.object({
  id: z.number(),
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: PasswordHashSchema,
  password_salt: PasswordSaltScheam,
  updated_at: z.number()
})

const RequestUserSchema = z.object({
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: PasswordHashSchema,
  password_salt: PasswordSaltScheam,
})

interface ResultUser extends RowDataPacket {
  id: number,
  email: string,
  tag: string,
  name: string,
  password_hash: string,
  password_salt: string,
  updated_at: number,
}

type RequestUser = z.infer<typeof RequestUserSchema>

export {
  ResultUser, RequestUser,
  ResultUserSchema, RequestUserSchema,
  EmailSchema, TagSchema, NameSchema, PasswordHashSchema, PasswordSaltScheam
}