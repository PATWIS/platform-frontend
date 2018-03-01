import { effects } from "redux-saga";
import { GetState } from "../../di/setupBindings";
import { symbols } from "../../di/symbols";
import { SignatureAuthApi } from "../../lib/api/SignatureAuthApi";
import { CryptoRandomString } from "../../lib/dependencies/cryptoRandomString";
import { ILogger } from "../../lib/dependencies/Logger";
import { ObjectStorage } from "../../lib/persistence/ObjectStorage";
import { Web3Manager } from "../../lib/web3/Web3Manager";
import { injectableFn } from "../../middlewares/redux-injectify";
import { actions } from "../actions";
import { loadUser } from "../auth/sagas";
import { callAndInject, getDependency, neuTake } from "../sagas";
import { selectEthereumAddressWithChecksum } from "../web3/reducer";

function* signInUser(): Iterator<any> {
  while (true) {
    yield neuTake("WALLET_SELECTOR_CONNECTED");

    try {
      yield obtainJWT();
      yield effects.spawn(loadUser);

      yield effects.put(actions.routing.goToDashboard());
    } catch (e) {
      yield effects.put(actions.wallet.messageSigningError("Error while signing a message!"));
    }
  }
}

export const obtainJwtPromise = injectableFn(
  async function(
    web3Manager: Web3Manager,
    getState: GetState,
    signatureAuthApi: SignatureAuthApi,
    cryptoRandomString: CryptoRandomString,
    logger: ILogger,
  ): Promise<string> {
    const address = selectEthereumAddressWithChecksum(getState().web3State);

    const salt = cryptoRandomString(64);

    const signerType = web3Manager.personalWallet!.signerType;

    logger.info("Obtaining auth challenge from api");
    const { body: { challenge } } = await signatureAuthApi.challenge(address, salt, signerType);

    logger.info("Signing challenge");
    const signedChallenge = await web3Manager.personalWallet!.signMessage(challenge);

    logger.info("Sending signed challenge back to api");
    const { body: { jwt } } = await signatureAuthApi.createJwt(
      challenge,
      signedChallenge,
      signerType,
    );

    return jwt;
  },
  [
    symbols.web3Manager,
    symbols.getState,
    symbols.signatureAuthApi,
    symbols.cryptoRandomString,
    symbols.logger,
  ],
);

function* saveJwtToStorage(jwt: string): Iterator<any> {
  const storage: ObjectStorage<string> = yield getDependency(symbols.jwtStorage);
  storage.set(jwt);
}

export const walletSelectorSagas = function*(): Iterator<effects.Effect> {
  yield effects.all([effects.fork(signInUser)]);
};

function* obtainJWT(): Iterator<any> {
  yield effects.put(actions.wallet.messageSigning());

  const jwt: string = yield callAndInject(obtainJwtPromise);
  yield effects.put(actions.auth.loadJWT(jwt));
  yield saveJwtToStorage(jwt);

  return jwt;
}
