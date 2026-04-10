import { User } from "better-auth";

export interface ForgetPassword {
  user: User;
  url: string;
  token: string;
}
