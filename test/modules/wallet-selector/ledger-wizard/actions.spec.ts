import { BigNumber } from "bignumber.js";
import { expect } from "chai";
import { spy } from "sinon";

import { walletConnectedAction } from "../../../../app/modules/wallet-selector/actions";
import {
  finishSettingUpLedgerConnectorAction,
  goToNextPageAndLoadDataAction,
  goToPreviousPageAndLoadDataAction,
  ledgerConnectionEstablishedAction,
  ledgerConnectionEstablishedErrorAction,
  ledgerWizardAccountsListNextPageAction,
  ledgerWizardAccountsListPreviousPageAction,
  loadLedgerAccountsAction,
  setDerivationPathPrefixAction,
  setLedgerAccountsAction,
  setLedgerWizardDerivationPathPrefixAction,
  tryEstablishingConnectionWithLedger,
  verifyIfLedgerStillConnected,
} from "../../../../app/modules/wallet-selector/ledger-wizard/actions";
import { DEFAULT_DERIVATION_PATH_PREFIX } from "../../../../app/modules/wallet-selector/ledger-wizard/reducer";
import {
  IDerivationPathToAddress,
  LedgerNotAvailableError,
  LedgerWallet,
  LedgerWalletConnector,
} from "../../../../app/modules/web3/LedgerWallet";
import { Web3Adapter } from "../../../../app/modules/web3/Web3Adapter";
import { WalletNotConnectedError, Web3Manager } from "../../../../app/modules/web3/Web3Manager";
import { IAppState } from "../../../../app/store";
import { Dictionary } from "../../../../app/types";
import { dummyNetworkId } from "../../../fixtures";
import { createMock } from "../../../testUtils";

describe("Wallet selector > Ledger wizard > actions", () => {
  describe("tryEstablishingConnectionWithLedger", () => {
    it("should try establishing connection", async () => {
      const expectedNetworkId = dummyNetworkId;

      const mockDispatch = spy();
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        connect: async () => {},
      });
      const web3ManagerMock = createMock(Web3Manager, {
        networkId: expectedNetworkId,
      });

      await tryEstablishingConnectionWithLedger(
        mockDispatch,
        ledgerWalletConnectorMock,
        web3ManagerMock,
      );

      expect(mockDispatch).to.be.calledWithExactly(ledgerConnectionEstablishedAction());
      expect(ledgerWalletConnectorMock.connect).to.be.calledWithExactly(expectedNetworkId);
    });

    it("should send error action on error", async () => {
      const expectedNetworkId = dummyNetworkId;

      const mockDispatch = spy();
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        connect: async () => {
          throw new LedgerNotAvailableError();
        },
      });
      const web3ManagerMock = createMock(Web3Manager, {
        networkId: expectedNetworkId,
      });

      await tryEstablishingConnectionWithLedger(
        mockDispatch,
        ledgerWalletConnectorMock,
        web3ManagerMock,
      );

      expect(mockDispatch).to.be.calledWithExactly(
        ledgerConnectionEstablishedErrorAction({ errorMsg: "Nano Ledger S not available" }),
      );
      expect(ledgerWalletConnectorMock.connect).to.be.calledWithExactly(expectedNetworkId);
    });
  });

  describe("loadLedgerAccountsAction", () => {
    it("should load accounts from ledger connector", async () => {
      const dummyState: Partial<IAppState> = {
        ledgerWizardState: {
          index: 1,
          numberOfAccountsPerPage: 10,
          derivationPathPrefix: "44'/60'/0'/",
          accounts: [],
          isLoadingAddresses: false,
          isConnectionEstablished: true,
        },
      };
      const expectedAccounts: IDerivationPathToAddress = {
        "44'/60'/0'/1": "0x131213123123",
        "44'/60'/0'/2": "0xab2245c",
      };
      const expectedAccountsToBalances: Dictionary<number> = {
        "0x131213123123": 4,
        "0xab2245c": 15,
      };

      const dispatchMock = spy();
      const getStateMock = spy(() => dummyState);
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        getMultipleAccounts: spy(() => expectedAccounts),
      });
      const web3ManagerMock = createMock(Web3Manager, {
        internalWeb3Adapter: createMock(Web3Adapter, {
          getBalance: (address: string) =>
            Promise.resolve(new BigNumber(expectedAccountsToBalances[address])),
        }),
      });

      await loadLedgerAccountsAction(
        dispatchMock,
        getStateMock,
        ledgerWalletConnectorMock,
        web3ManagerMock,
      );

      expect(ledgerWalletConnectorMock.getMultipleAccounts).to.calledWithExactly(
        dummyState.ledgerWizardState!.derivationPathPrefix,
        dummyState.ledgerWizardState!.index,
        dummyState.ledgerWizardState!.numberOfAccountsPerPage,
      );
      expect(dispatchMock).to.be.calledWithExactly(
        setLedgerAccountsAction({
          derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
          accounts: [
            {
              address: expectedAccounts["44'/60'/0'/1"],
              balance: expectedAccountsToBalances[expectedAccounts["44'/60'/0'/1"]].toString(),
              derivationPath: "44'/60'/0'/1",
            },
            {
              address: expectedAccounts["44'/60'/0'/2"],
              balance: expectedAccountsToBalances[expectedAccounts["44'/60'/0'/2"]].toString(),
              derivationPath: "44'/60'/0'/2",
            },
          ],
        }),
      );
    });
  });

  describe("goToNextPageAndLoadDataAction", () => {
    it("should work", async () => {
      const mockDispatch = spy();

      goToNextPageAndLoadDataAction(mockDispatch);

      expect(mockDispatch).to.be.calledTwice;
      expect(mockDispatch).to.be.calledWith(ledgerWizardAccountsListNextPageAction());
      expect(mockDispatch).to.be.calledWith(loadLedgerAccountsAction);
    });
  });

  describe("goToPreviousPageAndLoadDataAction", async () => {
    it("should work", () => {
      const mockDispatch = spy();

      goToPreviousPageAndLoadDataAction(mockDispatch);

      expect(mockDispatch).to.be.calledTwice;
      expect(mockDispatch).to.be.calledWith(ledgerWizardAccountsListPreviousPageAction());
      expect(mockDispatch).to.be.calledWith(loadLedgerAccountsAction);
    });
  });

  describe("setDerivationPathPrefixAction", () => {
    const newDP = "test";
    const dummyState: Partial<IAppState> = {
      ledgerWizardState: {
        index: 1,
        numberOfAccountsPerPage: 10,
        derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
        accounts: [],
        isLoadingAddresses: false,
        isConnectionEstablished: true,
      },
    };

    it("should do not fire when there is no change in derivationPathPrefix", async () => {
      const mockDispatch = spy();
      const getStateMock = spy(() => dummyState);

      await setDerivationPathPrefixAction(DEFAULT_DERIVATION_PATH_PREFIX)(
        mockDispatch,
        getStateMock,
      );

      expect(mockDispatch).have.not.been.called;
    });

    it("should fire when there is change in derivationPathPrefix", async () => {
      const mockDispatch = spy();
      const getStateMock = spy(() => dummyState);

      await setDerivationPathPrefixAction(newDP)(mockDispatch, getStateMock);

      expect(mockDispatch).to.be.calledTwice;
      expect(mockDispatch).to.be.calledWithExactly(
        setLedgerWizardDerivationPathPrefixAction({ derivationPathPrefix: newDP }),
      );
      expect(mockDispatch).to.be.calledWithExactly(loadLedgerAccountsAction);
    });
  });

  describe("finishSettingUpLedgerConnectorAction", () => {
    it("should work when ledger wallet is connected", async () => {
      const expectedDerivationPath = "44'/60'/0'/2";

      const dispatchMock = spy();
      const ledgerWalletMock = createMock(LedgerWallet, {});
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        finishConnecting: async () => ledgerWalletMock,
      });
      const web3ManagerMock = createMock(Web3Manager, {
        plugPersonalWallet: async () => {},
      });

      await finishSettingUpLedgerConnectorAction(expectedDerivationPath)(
        dispatchMock,
        ledgerWalletConnectorMock,
        web3ManagerMock,
      );

      expect(ledgerWalletConnectorMock.finishConnecting).to.be.calledWithExactly(
        expectedDerivationPath,
      );
      expect(web3ManagerMock.plugPersonalWallet).to.be.calledWithExactly(ledgerWalletMock);
      expect(dispatchMock).to.be.calledWithExactly(walletConnectedAction);
    });

    it("should not navigate when ledger wallet is not connected", async () => {
      // @todo exact behaviour should be specified
      const expectedDerivationPath = "44'/60'/0'/2";

      const navigateToMock = spy();
      const ledgerWalletMock = createMock(LedgerWallet, {});
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        finishConnecting: async () => ledgerWalletMock,
      });
      const web3ManagerMock = createMock(Web3Manager, {
        plugPersonalWallet: async () => {
          throw new WalletNotConnectedError(ledgerWalletMock);
        },
      });

      await finishSettingUpLedgerConnectorAction(expectedDerivationPath)(
        navigateToMock,
        ledgerWalletConnectorMock,
        web3ManagerMock,
      ).catch(() => {});

      expect(ledgerWalletConnectorMock.finishConnecting).to.be.calledWithExactly(
        expectedDerivationPath,
      );
      expect(web3ManagerMock.plugPersonalWallet).to.be.calledWithExactly(ledgerWalletMock);
      expect(navigateToMock).not.be.called;
    });
  });

  describe("verifyIfLedgerStillConnected", () => {
    it("should do nothing if ledger is connected", async () => {
      const dispatchMock = spy();
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        testConnection: async () => true,
      });

      await verifyIfLedgerStillConnected(dispatchMock, ledgerWalletConnectorMock);

      expect(ledgerWalletConnectorMock.testConnection).to.be.calledOnce;
      expect(dispatchMock).to.not.be.called;
    });

    it("should issue error action if ledger is not connected", async () => {
      const dispatchMock = spy();
      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        testConnection: async () => false,
      });

      await verifyIfLedgerStillConnected(dispatchMock, ledgerWalletConnectorMock);

      expect(ledgerWalletConnectorMock.testConnection).to.be.calledOnce;
      expect(dispatchMock).to.be.calledWithExactly(
        ledgerConnectionEstablishedErrorAction({ errorMsg: "Nano Ledger S not available" }),
      );
    });
  });
});
