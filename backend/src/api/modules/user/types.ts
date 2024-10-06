import { z } from "zod"

const EmailSchema = z.string().min(10).max(200).email()
const TagSchema = z.string().min(2).max(100).startsWith("@").regex(/^@[0-9a-zA-Z_]+$/)
const NameSchema = z.string().min(1).max(100)

const ResultUserSchema = z.object({
  id: z.number(),
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: z.string().length(64),
  password_salt: z.string().length(8),
  updated_at: z.any()
})

const RequestUserSchema = z.object({
  email: EmailSchema,
  tag: TagSchema,
  name: NameSchema,
  password_hash: z.string().length(64),
  password_salt: z.string().length(8),
})

type ResultUser = z.infer<typeof ResultUserSchema>
type RequestUser = z.infer<typeof RequestUserSchema>

export { ResultUser, RequestUser, ResultUserSchema, RequestUserSchema }