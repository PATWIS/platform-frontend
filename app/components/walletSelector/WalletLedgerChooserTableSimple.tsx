import * as cn from "classnames";
import * as React from "react";

import { ILedgerAccount } from "../../modules/wallet-selector/ledger-wizard/reducer";
import { ButtonSecondary } from "../shared/Buttons";
import * as styles from "./WalletLedgerChooserTableSimple.module.scss";

interface IAccountRow {
  ledgerAccount: ILedgerAccount;
  handleAddressChosen: (ledgerAccount: ILedgerAccount) => void;
}

export class AccountRow extends React.Component<IAccountRow> {
  handleClick = () => {
    this.props.handleAddressChosen(this.props.ledgerAccount);
  };

  render(): React.ReactNode {
    return (
      <tr data-test-id="account-row">
        <td data-test-id="account-address" className={styles.publicKey}>
          {this.props.ledgerAccount.address}
        </td>
        <td data-test-id="account-balance-eth" className={cn(styles.currencyCol, styles.ethCol)}>
          {this.props.ledgerAccount.balanceETH} <span>ETH</span>
        </td>
        <td data-test-id="account-balance-neu" className={cn(styles.currencyCol, styles.neuCol)}>
          {this.props.ledgerAccount.balanceNEU} <span>NEU</span>
        </td>
        <td className={styles.select}>
          <ButtonSecondary data-test-id="button-select" onClick={this.handleClick}>
            Select
          </ButtonSecondary>
        </td>
      </tr>
    );
  }
}

export interface IWalletLedgerChooserTableSimple {
  accounts: ILedgerAccount[];
  handleAddressChosen: (ledgerAccount: ILedgerAccount) => void;
}

export const WalletLedgerChooserTableSimple: React.SFC<IWalletLedgerChooserTableSimple> = ({
  accounts,
  handleAddressChosen,
}) => (
  <table className={styles.table}>
    <thead>
      <tr>
        <th className="py-3">Public wallet id</th>
        <th colSpan={3}>Balance</th>
      </tr>
    </thead>
    <tbody data-test-id="wallet-ledger-accounts-table-body">
      {accounts.map(a => (
        <AccountRow
          key={a.derivationPath}
          ledgerAccount={a}
          handleAddressChosen={handleAddressChosen}
        />
      ))}
    </tbody>
  </table>
);
