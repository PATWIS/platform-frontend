import { inject, injectable } from "inversify";

import { symbols } from "../../../di/symbols";
import { ILogger } from "../../dependencies/Logger";
import { IHttpClient } from "../client/IHttpClient";
import { IUser, IUserInput, IVerifyEmailUser, UserValidator } from "./interfaces";

const USER_API_ROOT = "/api/user";

export class UserApiError extends Error {}
export class UserNotExisting extends UserApiError {}

@injectable()
export class UsersApi {
  constructor(
    @inject(symbols.authorizedHttpClient) private httpClient: IHttpClient,
    @inject(symbols.logger) private logger: ILogger,
  ) {}

  public async createAccount(newUser?: IUserInput): Promise<IUser> {
    this.logger.info("Creating account for email: ", newUser && newUser.newEmail);

    const response = await this.httpClient.post<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/",
      responseSchema: UserValidator,
      body: newUser || {},
    });

    return response.body;
  }

  public async me(): Promise<IUser> {
    const response = await this.httpClient.get<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me",
      responseSchema: UserValidator,
      allowedStatusCodes: [404],
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }

    return response.body;
  }

  public async verifyUserEmail(userCode: IVerifyEmailUser): Promise<IUser> {
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me/email-verification",
      responseSchema: UserValidator,
      allowedStatusCodes: [404],
      body: userCode,
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }

    return response.body;
  }

  public async updateUser(updatedUser: IUserInput): Promise<IUser> {
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me",
      responseSchema: UserValidator,
      allowedStatusCodes: [404],
      body: updatedUser,
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }

    return response.body;
  }
}
