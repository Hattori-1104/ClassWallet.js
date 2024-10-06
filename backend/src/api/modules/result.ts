type MethodResultSuccess<T> = {
  type: 'success',
  payload: T
}
type MethodResultError = {
  type: 'error',
  error: {
    code: string,
    message?: string
  }
}

export type MethodResult<T = any> = MethodResultSuccess<T> | MethodResultError