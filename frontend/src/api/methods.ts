import { AxiosResponse } from 'axios';
import _Api from './api'
import { Result } from '../modules/types/result';

interface User {
  email: string;
  tag: string;
  name: string;
  password_hash: string;
}

async function getUserAll(): Promise<AxiosResponse<Result<User[]>>> {
  return await _Api().get("/api/user")
}
async function getUser(user_identifier: string): Promise<AxiosResponse<Result<User>>> {
  return await _Api().get(`/api/user/${user_identifier}`)
}
async function registerUser(user_data: User): Promise<AxiosResponse<Result<{id: number}>>> {
  return await _Api().post("/api/user", user_data)
}
async function deleteUser(user_identifier: string): Promise<AxiosResponse<Result<undefined>>> {
  return await _Api().delete(`/api/user/${user_identifier}`)
}
async function checkUserExistance(user_identifier: string): Promise<AxiosResponse<Result<{existance: boolean}>>> {
  return await _Api().get(`/api/user/existance/${user_identifier}`)
}
async function verifyUser(user_identifier: string, password_hash: string): Promise<AxiosResponse<Result<{verified: boolean}>>> {
  return await _Api().get(`/api/user/verify/${user_identifier}/${password_hash}`)
}

const Api = { getUserAll, getUser, registerUser, deleteUser, checkUserExistance, verifyUser }
export default Api