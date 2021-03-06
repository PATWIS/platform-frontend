import * as Eip55 from "eip55";

import { EthereumAddress, EthereumAddressWithChecksum, EthereumNetworkId } from "../../types";

export function makeEthereumAddressChecksummed(
  ethereumAddress: EthereumAddress,
): EthereumAddressWithChecksum {
  return Eip55.encode(ethereumAddress) as EthereumAddressWithChecksum;
}

export function ethereumNetworkIdToNetworkName(networkId: EthereumNetworkId): string {
  switch (networkId) {
    case "0":
      return "Dev";
    case "1":
      return "Mainnet";
    case "2":
      return "Morden";
    case "3":
      return "Ropsten";
    case "4":
      return "Rinkeby";
    default:
      return "Unknown";
  }
}
