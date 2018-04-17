import * as Yup from "yup";

export type TUserType = "investor" | "issuer";

export interface IUser {
  backupCodesVerified?: boolean;
  language?: string;
  unverifiedEmail?: string;
  verifiedEmail?: string;
  type: TUserType;
}

export interface IUserInput {
  newEmail?: string;
  salt?: string;
  language?: string;
  backupCodesVerified?: boolean;
  type: TUserType;
}

export interface IVerifyEmailUser {
  verificationCode: string;
}

export const UserValidator = Yup.object()
  .shape({
    backupCodesVerified: Yup.boolean(),
    language: Yup.string(),
    unverifiedEmail: Yup.string(),
    verifiedEmail: Yup.string(),
    type: Yup.string().oneOf(["investor", "eto"]),
  })
  .required();
