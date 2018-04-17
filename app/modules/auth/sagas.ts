import { effects } from "redux-saga";
import { call, Effect, fork } from "redux-saga/effects";
import { TGlobalDependencies } from "../../di/setupBindings";
import { IUser, IUserInput } from "../../lib/api/users/interfaces";
import { UserNotExisting } from "../../lib/api/users/UsersApi";
import { hasValidPermissions } from "../../utils/JWTUtils";
import { accessWalletAndRunEffect } from "../accessWallet/sagas";
import { actions } from "../actions";
import { neuCall, neuTakeEvery } from "../sagas";
import { selectEthereumAddressWithChecksum } from "../web3/reducer";
import { WalletType } from "../web3/types";
import { IAppState } from "./../../store";
import { selectActivationCodeFromQueryString } from "./../web3/reducer";
import { selectRedirectURLFromQueryString } from "./selectors";

export function* loadJwt({ jwtStorage }: TGlobalDependencies): Iterator<Effect> {
  const jwt = jwtStorage.get();
  if (jwt) {
    yield effects.put(actions.auth.loadJWT(jwt));
    return jwt;
  }
}

export async function loadUserPromise({
  apiUserService,
  walletMetadataStorage,
}: TGlobalDependencies): Promise<IUser> {
  try {
    return await apiUserService.me();
  } catch (e) {
    if (!(e instanceof UserNotExisting)) {
      throw e;
    }
  }

  // for light wallet we need to send slightly different request
  const walletMetadata = walletMetadataStorage.get();
  if (walletMetadata && walletMetadata.walletType === WalletType.LIGHT) {
    return apiUserService.createAccount({
      newEmail: walletMetadata.email,
      salt: walletMetadata.salt,
      backupCodesVerified: false,
      type: "investor",
    });
  } else {
    return apiUserService.createAccount({
      backupCodesVerified: true,
      type: "investor",
    });
  }
}

export async function verifyUserEmailPromise({
  apiUserService,
  getState,
  notificationCenter,
}: TGlobalDependencies): Promise<void> {
  const userCode = selectActivationCodeFromQueryString(getState().router);
  if (!userCode) return;
  try {
    await apiUserService.verifyUserEmail(userCode);
    notificationCenter.info("Your email was verified successfully.");
  } catch (e) {
    notificationCenter.error("Failed to verify your email.");
  }
}

export async function updateUserPromise(
  { apiUserService }: TGlobalDependencies,
  user: IUserInput,
): Promise<IUser> {
  await apiUserService.me();
  return apiUserService.updateUser(user);
}

export function* loadUser(): Iterator<any> {
  const user: IUser = yield neuCall(loadUserPromise);
  yield effects.put(actions.auth.loadUser(user));
}

export function* updateUser(updatedUser: IUserInput): Iterator<any> {
  const user: IUser = yield neuCall(updateUserPromise, updatedUser);
  yield effects.put(actions.auth.loadUser(user));
}

function* logoutWatcher({ web3Manager, jwtStorage }: TGlobalDependencies): Iterator<any> {
  jwtStorage.clear();
  yield web3Manager.unplugPersonalWallet();
  yield effects.put(actions.routing.goHome());
  yield effects.put(actions.init.start());
}

function* signInUser(): Iterator<any> {
  try {
    yield effects.put(actions.walletSelector.messageSigning());
    yield neuCall(obtainJWT);
  } catch (e) {
    yield effects.put(actions.walletSelector.messageSigningError("Error while signing a message!"));
  }

  try {
    yield neuCall(loadUser);

    const redirectionUrl = yield effects.select((state: IAppState) =>
      selectRedirectURLFromQueryString(state.router),
    );
    if (redirectionUrl) {
      yield effects.put(actions.routing.goTo(redirectionUrl));
    } else {
      yield effects.put(actions.routing.goToDashboard());
    }
  } catch (e) {
    yield effects.put(
      actions.walletSelector.messageSigningError("Error while connecting with server!"),
    );
  }
}

function* verifyUserEmail(): Iterator<any> {
  yield neuCall(verifyUserEmailPromise);
  yield neuCall(loadUser);
  yield effects.put(actions.routing.goHome());
}

/**
 * Saga & Promise to fetch a new jwt from the authentication server
 */
export async function obtainJwtPromise(
  { getState, web3Manager, signatureAuthApi, cryptoRandomString, logger }: TGlobalDependencies,
  permissions: Array<string> = [],
): Promise<string> {
  const address = selectEthereumAddressWithChecksum(getState().web3);

  const salt = cryptoRandomString(64);

  /* tslint:disable: no-useless-cast */
  const signerType = web3Manager.personalWallet!.signerType;
  /* tslint:enable: no-useless-cast */

  logger.info("Obtaining auth challenge from api");
  const { body: { challenge } } = await signatureAuthApi.challenge(
    address,
    salt,
    signerType,
    permissions,
  );

  logger.info("Signing challenge");
  /* tslint:disable: no-useless-cast */
  const signedChallenge = await web3Manager.personalWallet!.signMessage(challenge);
  /* tslint:enable: no-useless-cast */

  logger.info("Sending signed challenge back to api");
  const { body: { jwt } } = await signatureAuthApi.createJwt(
    challenge,
    signedChallenge,
    signerType,
  );

  return jwt;
}

// see above
function* obtainJWT(
  { jwtStorage }: TGlobalDependencies,
  permissions: Array<string> = [],
): Iterator<any> {
  const jwt: string = yield neuCall(obtainJwtPromise, permissions);
  yield effects.put(actions.auth.loadJWT(jwt));
  jwtStorage.set(jwt);

  return jwt;
}

/**
 * Saga to ensure all the needed permissions are present and still valid
 * on the current jwt
 */
export function* ensurePermissionsArePresent(
  { jwtStorage }: TGlobalDependencies,
  permissions: Array<string> = [],
  title: string = "",
  message: string = "",
): Iterator<any> {
  // check wether all permissions are present and still valid
  const jwt = jwtStorage.get();
  if (jwt && hasValidPermissions(jwt, permissions)) {
    return;
  }
  // obtain a freshly signed token with missing permissions
  try {
    const obtainJwtEffect = neuCall(obtainJWT, permissions);
    yield call(accessWalletAndRunEffect, obtainJwtEffect, title, message);
  } catch {
    throw new Error("Message signing failed");
  }
}

export const authSagas = function*(): Iterator<effects.Effect> {
  yield fork(neuTakeEvery, "AUTH_LOGOUT", logoutWatcher);
  yield fork(neuTakeEvery, "AUTH_VERIFY_EMAIL", verifyUserEmail);
  yield fork(neuTakeEvery, "WALLET_SELECTOR_CONNECTED", signInUser);
};
