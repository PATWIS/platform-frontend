import { createAction, createSimpleAction } from "../../actionsUtils";
import { ILedgerAccount } from "./reducer";

export const LEDGER_WIZARD_SIMPLE_DERIVATION_PATHS = ["44'/60'/1'/0", "44'/60'/0'/0"]; // TODO this should be taken from config

export const ledgerWizardActions = {
  ledgerWizardAccountsListNextPage: () =>
    createSimpleAction("LEDGER_WIZARD_ACCOUNTS_LIST_NEXT_PAGE"),

  ledgerWizardAccountsListPreviousPage: () =>
    createSimpleAction("LEDGER_WIZARD_ACCOUNTS_LIST_PREVIOUS_PAGE"),

  ledgerConnectionEstablished: () => createSimpleAction("LEDGER_CONNECTION_ESTABLISHED"),

  ledgerConnectionEstablishedError: (errorMsg: string) =>
    createAction("LEDGER_CONNECTION_ESTABLISHED_ERROR", { errorMsg }),

  setLedgerWizardDerivationPathPrefix: (derivationPathPrefix: string) =>
    createAction("SET_LEDGER_WIZARD_DERIVATION_PATH_PREFIX", { derivationPathPrefix }),

  ledgerWizardDerivationPathPrefixError: () =>
    createSimpleAction("LEDGER_WIZARD_DERIVATION_PATH_PREFIX_ERROR"),

  toggleLedgerAccountsAdvanced: () => createSimpleAction("TOGGLE_LEDGER_WIZARD_ADVANCED"),

  setLedgerAccounts: (accounts: ILedgerAccount[], derivationPathPrefix: string) =>
    createAction("SET_LEDGER_WIZARD_ACCOUNTS", { accounts, derivationPathPrefix }),
};
