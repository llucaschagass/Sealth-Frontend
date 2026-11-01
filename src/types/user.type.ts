export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

/** Campos vazios ou ausentes mantêm o valor atual no backend. */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}
