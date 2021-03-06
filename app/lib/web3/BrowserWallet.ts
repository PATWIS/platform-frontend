import { promisify } from "bluebird";
import hex2ascii = require("hex2ascii");
import { injectable } from "inversify";
import * as Web3 from "web3";

import { WalletSubType, WalletType } from "../../modules/web3/types";
import { EthereumAddress, EthereumNetworkId } from "../../types";
import { IBrowserWalletMetadata } from "../persistence/WalletMetadataObjectStorage";
import { IPersonalWallet, SignerType } from "./PersonalWeb3";
import { Web3Adapter } from "./Web3Adapter";

export class BrowserWalletError extends Error {}
export class BrowserWalletMissingError extends BrowserWalletError {}
export class BrowserWalletMismatchedNetworkError extends BrowserWalletError {
  constructor(
    public readonly desiredNetworkId: EthereumNetworkId,
    public readonly actualNetworkId: EthereumNetworkId,
  ) {
    super("MismatchedNetworkError");
  }
}
export class BrowserWalletLockedError extends BrowserWalletError {}

export class BrowserWallet implements IPersonalWallet {
  public readonly walletType = WalletType.BROWSER;
  // todo: signerType depends on wallet subtype. parity has eth_sign, metamask one below
  public readonly signerType = SignerType.ETH_SIGN_TYPED_DATA;

  constructor(
    public readonly web3Adapter: Web3Adapter,
    public readonly walletSubType: WalletSubType,
    public readonly ethereumAddress: EthereumAddress,
  ) {}

  public async testConnection(networkId: string): Promise<boolean> {
    const currentNetworkId = await this.web3Adapter.getNetworkId();
    if (currentNetworkId !== networkId) {
      return false;
    }

    return !!await this.web3Adapter.getAccountAddress();
  }

  public async signMessage(data: string): Promise<string> {
    if (this.walletSubType === WalletSubType.METAMASK) {
      const typedDataDecoded = JSON.parse(hex2ascii(data));

      return this.web3Adapter.signTypedData(this.ethereumAddress, typedDataDecoded);
    } else {
      return this.web3Adapter.ethSign(this.ethereumAddress, data);
    }
  }

  public getMetadata(): IBrowserWalletMetadata {
    return {
      address: this.ethereumAddress,
      walletType: WalletType.BROWSER,
    };
  }
}

@injectable()
export class BrowserWalletConnector {
  public async connect(networkId: EthereumNetworkId): Promise<BrowserWallet> {
    const newInjectedWeb3 = (window as any).web3;
    if (typeof newInjectedWeb3 === "undefined") {
      throw new BrowserWalletMissingError();
    }
    const newWeb3 = new Web3(newInjectedWeb3.currentProvider);

    const web3Adapter = new Web3Adapter(newWeb3);
    // check for mismatched networkIds
    const personalWeb3NetworkId = await web3Adapter.getNetworkId();
    if (networkId !== personalWeb3NetworkId) {
      throw new BrowserWalletMismatchedNetworkError(networkId, personalWeb3NetworkId);
    }

    // check for locked wallet
    if (!await web3Adapter.getAccountAddress()) {
      throw new BrowserWalletLockedError();
    }

    const walletType = await this.getBrowserWalletType(web3Adapter.web3);
    const ethereumAddress = await web3Adapter.getAccountAddress();

    return new BrowserWallet(web3Adapter, walletType, ethereumAddress);
  }

  private async getBrowserWalletType(web3: Web3): Promise<WalletSubType> {
    const nodeIdString = await promisify(web3.version.getNode)();
    const matchNodeIdString = nodeIdString.toLowerCase();

    if (matchNodeIdString.includes("metamask")) {
      return WalletSubType.METAMASK;
    }
    if (matchNodeIdString.includes("parity")) {
      return WalletSubType.PARITY;
    }
    // @todo support for mist
    return WalletSubType.UNKNOWN;
  }
}
