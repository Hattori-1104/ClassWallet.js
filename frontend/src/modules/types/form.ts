type FormMode = "blank" | "valid" | "invalid" | "pending" | "error"
type EmitFormInput = { valid: false } | { valid: true, value: string }

export type { FormMode, EmitFormInput }