import { Request } from 'express';

export interface TokenPayload {
  id: string;
  email: string;
}
export type RequestObject = Request & { token?: TokenPayload };
