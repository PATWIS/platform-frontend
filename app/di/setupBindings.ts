import { Container } from "inversify";
import { push } from "react-router-redux";
import { MiddlewareAPI } from "redux";
import { IConfig } from "../config/getConfig";
import { IHttpClient } from "../lib/api/client/IHttpClient";
import { JsonHttpClient } from "../lib/api/client/JsonHttpClient";
import { SignatureAuthApi } from "../lib/api/SignatureAuthApi";
import { UsersApi } from "../lib/api/users/UsersApi";
import { VaultApi } from "../lib/api/vault/VaultApi";
import { cryptoRandomString, CryptoRandomString } from "../lib/dependencies/cryptoRandomString";
import { DevConsoleLogger, ILogger } from "../lib/dependencies/Logger";
import { NotificationCenter } from "../lib/dependencies/NotificationCenter";
import { Storage } from "../lib/persistence/Storage";
import { BrowserWalletConnector } from "../lib/web3/BrowserWallet";
import { LedgerWalletConnector } from "../lib/web3/LedgerWallet";
import { LightWalletConnector, LightWalletUtil } from "../lib/web3/LightWallet";
import { IEthereumNetworkConfig, Web3Manager } from "../lib/web3/Web3Manager";
import { IAppState } from "../store";
import {
  AsyncIntervalSchedulerFactory,
  AsyncIntervalSchedulerFactoryType,
} from "../utils/AsyncIntervalScheduler";

import { AuthorizedJsonHttpClient } from "../lib/api/client/AuthJsonHttpClient";
import { KycApi } from "../lib/api/KycApi";
import { detectBrowser, TDetectBrowser } from "../lib/dependencies/detectBrowser";
import { STORAGE_JWT_KEY } from "../lib/persistence/JwtObjectStorage";
import { ObjectStorage } from "../lib/persistence/ObjectStorage";
import {
  STORAGE_WALLET_METADATA_KEY,
  TWalletMetadata,
} from "../lib/persistence/WalletMetadataObjectStorage";
import { ContractsService } from "../lib/web3/ContractsService";
import { symbols } from "./symbols";

export type NavigateTo = (path: string) => void;
export type GetState = () => IAppState;

export function setupBindings(config: IConfig): Container {
  const container = new Container();
  const storage = new Storage(window.localStorage);

  // functions
  container
    .bind<CryptoRandomString>(symbols.cryptoRandomString)
    .toConstantValue(cryptoRandomString);
  container.bind<TDetectBrowser>(symbols.detectBrowser).toConstantValue(detectBrowser);

  // configs
  container
    .bind<IEthereumNetworkConfig>(symbols.ethereumNetworkConfig)
    .toConstantValue(config.ethereumNetwork);
  container.bind<IConfig>(symbols.config).toConstantValue(config);

  // @todo different logger could be injected to each class with additional info like name of the file etc.
  container.bind<ILogger>(symbols.logger).toConstantValue(new DevConsoleLogger());

  // classes
  container
    .bind<IHttpClient>(symbols.jsonHttpClient)
    .to(JsonHttpClient)
    .inSingletonScope();
  container
    .bind<IHttpClient>(symbols.authorizedHttpClient)
    .to(AuthorizedJsonHttpClient)
    .inSingletonScope();

  // singletons
  container
    .bind<SignatureAuthApi>(symbols.signatureAuthApi)
    .to(SignatureAuthApi)
    .inSingletonScope();

  container
    .bind<LightWalletUtil>(symbols.lightWalletUtil)
    .to(LightWalletUtil)
    .inSingletonScope();

  container
    .bind<VaultApi>(symbols.vaultApi)
    .to(VaultApi)
    .inSingletonScope();

  container
    .bind<UsersApi>(symbols.usersApi)
    .to(UsersApi)
    .inSingletonScope();

  container.bind<Storage>(symbols.storage).toConstantValue(storage);
  container
    .bind<NotificationCenter>(symbols.notificationCenter)
    .to(NotificationCenter)
    .inSingletonScope();

  // web3 & blockchain
  container
    .bind(symbols.contractsService)
    .to(ContractsService)
    .inSingletonScope();
  container
    .bind<LedgerWalletConnector>(symbols.ledgerWalletConnector)
    .to(LedgerWalletConnector)
    .inSingletonScope();

  container
    .bind<LightWalletConnector>(symbols.lightWalletConnector)
    .to(LightWalletConnector)
    .inSingletonScope();

  container
    .bind<BrowserWalletConnector>(symbols.browserWalletConnector)
    .to(BrowserWalletConnector)
    .inSingletonScope();
  container
    .bind<Web3Manager>(symbols.web3Manager)
    .to(Web3Manager)
    .inSingletonScope();
  container
    .bind<KycApi>(symbols.apiKycService)
    .to(KycApi)
    .inSingletonScope();

  // factories
  container
    .bind<AsyncIntervalSchedulerFactoryType>(symbols.asyncIntervalSchedulerFactory)
    .toFactory(AsyncIntervalSchedulerFactory);

  // dynamic bindings (with inSingletonScope this works like lazy binding)
  container
    .bind<ObjectStorage<TWalletMetadata>>(symbols.walletMetadataStorage)
    .toDynamicValue(
      ctx =>
        new ObjectStorage<TWalletMetadata>(
          ctx.container.get(symbols.storage),
          ctx.container.get(symbols.logger),
          STORAGE_WALLET_METADATA_KEY,
        ),
    )
    .inSingletonScope();
  container
    .bind<ObjectStorage<string>>(symbols.jwtStorage)
    .toDynamicValue(
      ctx =>
        new ObjectStorage<string>(
          ctx.container.get(symbols.storage),
          ctx.container.get(symbols.logger),
          STORAGE_JWT_KEY,
        ),
    )
    .inSingletonScope();

  return container;
}

export function customizerContainerWithMiddlewareApi(
  container: Container,
  { dispatch, getState }: MiddlewareAPI<any>,
): Container {
  container.bind(symbols.appDispatch).toConstantValue(dispatch);
  container.bind(symbols.getState).toConstantValue(() => getState());
  container.bind(symbols.navigateTo).toConstantValue((path: string) => dispatch(push(path)));

  return container;
}

/**
 * We use plain object for injecting deps into sagas
 */
export const createGlobalDependencies = (container: Container) => ({
  // misc
  logger: container.get<ILogger>(symbols.logger),
  notificationCenter: container.get<NotificationCenter>(symbols.notificationCenter),

  // TODO this should be replace by sagas yield select in the future
  getState: container.get<GetState>(symbols.getState),
  cryptoRandomString: container.get<CryptoRandomString>(symbols.cryptoRandomString),
  detectBrowser: container.get<TDetectBrowser>(symbols.detectBrowser),

  // blockchain & wallets
  contractsService: container.get<ContractsService>(symbols.contractsService),
  web3Manager: container.get<Web3Manager>(symbols.web3Manager),
  walletMetadataStorage: container.get<ObjectStorage<TWalletMetadata>>(
    symbols.walletMetadataStorage,
  ),
  lightWalletConnector: container.get<LightWalletConnector>(symbols.lightWalletConnector),
  jwtStorage: container.get<ObjectStorage<string>>(symbols.jwtStorage),
  lightWalletUtil: container.get<LightWalletUtil>(symbols.lightWalletUtil),
  browserWalletConnector: container.get<BrowserWalletConnector>(symbols.browserWalletConnector),
  ledgerWalletConnector: container.get<LedgerWalletConnector>(symbols.ledgerWalletConnector),

  // network layer
  jsonHttpClient: container.get<JsonHttpClient>(symbols.jsonHttpClient),
  authorizedHttpClient: container.get<AuthorizedJsonHttpClient>(symbols.authorizedHttpClient),

  // apis
  signatureAuthApi: container.get<SignatureAuthApi>(symbols.signatureAuthApi),
  apiKycService: container.get<KycApi>(symbols.apiKycService),
  apiUserService: container.get<UsersApi>(symbols.usersApi),
  vaultApi: container.get<VaultApi>(symbols.vaultApi),
});

const globalDependencies = (false as true) && createGlobalDependencies(new Container());
export type TGlobalDependencies = typeof globalDependencies;
