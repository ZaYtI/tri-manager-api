import { User } from "src/user/entities/user.entity";

export interface ForgetPassword {
  user: User;
  url: string;
  token: string;
}
