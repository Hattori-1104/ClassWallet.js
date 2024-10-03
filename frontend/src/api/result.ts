
type SuccessResult<T> = {
  type: 'success';
  payload?: T;
}
type SimpleError = {
  message: string;
}
type ErrorResult = {
  type: 'error';
  error?: Error | SimpleError;
}
export type Result<T = any> = SuccessResult<T> | ErrorResult