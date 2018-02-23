import { effects } from "redux-saga";
import { symbols } from "../../di/symbols";
import { IUserData, UsersApi } from "../../lib/api/UsersApi";
import { ObjectStorage } from "../../lib/persistence/ObjectStorage";
import { TWalletMetadata } from "../../lib/persistence/WalletMetadataObjectStorage";
import { actions } from "../actions";
import { getDependency, neuTake } from "../sagas";
import { WalletType } from "../web3/types";

function* startup(): Iterator<any> {
  yield neuTake("APP_INIT");
  const jwt = yield effects.spawn(loadJwtFromStorage);
  if (jwt) {
    yield effects.spawn(loadUser);
  }
}

function* loadJwtFromStorage(): Iterator<any> {
  const storage: ObjectStorage<string> = yield getDependency(symbols.jwtStorage);
  const jwt = storage.get();
  if (jwt) {
    yield effects.put(actions.auth.loadJWT(jwt));
    return jwt;
  }
}

export function* loadUser(): Iterator<any> {
  const usersApi: UsersApi = yield getDependency(symbols.usersApi);
  const walletMetadataStorage: ObjectStorage<TWalletMetadata> = yield getDependency(
    symbols.walletMetadataStorage,
  );
  let me: IUserData | undefined = yield usersApi.me();

  if (!me) {
    const walletMetadata = walletMetadataStorage.get();
    // tslint:disable-next-line
    if (walletMetadata && walletMetadata.walletType === WalletType.LIGHT) {
      me = yield usersApi.createAccount(walletMetadata.email, walletMetadata.salt);
    } else {
      me = yield usersApi.createAccount();
    }
  }
  yield effects.put(actions.auth.loadUser(me!));
}

export const authSagas = function*(): Iterator<effects.Effect> {
  yield effects.all([effects.fork(startup)]);
};