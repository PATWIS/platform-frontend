import * as cn from "classnames";
import * as React from "react";
import { Col, Row } from "reactstrap";
import { compose } from "redux";

import { appConnect } from "../../store";
import { withActionWatcher } from "../../utils/withActionWatcher";
import { WarningAlert } from "../shared/WarningAlert";

import * as imgStep1 from "../../assets/img/wallet_selector/ledger_login_step_1.svg";
import * as imgStep2 from "../../assets/img/wallet_selector/ledger_login_step_2.svg";
import * as imgStep3 from "../../assets/img/wallet_selector/ledger_login_step_3.svg";
import { ledgerWizardFlows } from "../../modules/wallet-selector/ledger-wizard/flows";
import { selectIsLoginRoute } from "../../modules/wallet-selector/selectors";
import { LoadingIndicator } from "../shared/LoadingIndicator";
import * as styles from "./WalletLedgerInitComponent.module.scss";

export const LEDGER_RECONNECT_INTERVAL = 2000;

interface IInitStep {
  header: string;
  img: string;
  desc: string;
}

const InitStep: React.SFC<IInitStep> = ({ header, img, desc }) => (
  <Col xs="12" md="4" className={cn("mb-4 mb-md-0 px-4", styles.step)}>
    <div className={styles.header}>{header}</div>
    <img className="my-2 my-md-5" src={img} />
    <p>{desc}</p>
  </Col>
);

interface IWalletLedgerInitComponentProps {
  isInitialConnectionInProgress: boolean;
  errorMessage?: string;
  isLoginRoute: boolean;
}

export const WalletLedgerInitComponent: React.SFC<IWalletLedgerInitComponentProps> = ({
  errorMessage,
  isLoginRoute,
  isInitialConnectionInProgress,
}) => {
  if (isInitialConnectionInProgress) {
    return <LoadingIndicator />;
  }
  return (
    <>
      <Row>
        <Col>
          <h1 className="text-center">
            {isLoginRoute ? "Log in with Nano Ledger" : "Register your Nano Ledger"}
          </h1>
        </Col>
      </Row>
      {errorMessage && (
        <Row className="justify-content-center">
          <WarningAlert className="my-4">
            Connection status: <span data-test-id="ledger-wallet-error-msg">{errorMessage}</span>
          </WarningAlert>
        </Row>
      )}
      <Row>
        <InitStep
          header="1. Connect to USB"
          img={imgStep1}
          desc="Connect your Ledger Nano into USB and prepare your PIN Code for the device"
        />
        <InitStep
          header="2. Enter Pin Code"
          img={imgStep2}
          desc="Use left and right key to enter numbers and press 2 keys at the same time to confirm the code"
        />
        <InitStep
          header="3. Pick Ethereum"
          img={imgStep3}
          desc="Click on arrows to scroll  apps and pick Ethereum icon. Press 2 keys at the same time to confirm"
        />
      </Row>
    </>
  );
};

export const WalletLedgerInit = compose<React.SFC>(
  withActionWatcher({
    actionCreator: dispatch => dispatch(ledgerWizardFlows.tryEstablishingConnectionWithLedger),
    interval: LEDGER_RECONNECT_INTERVAL,
  }),
  appConnect<IWalletLedgerInitComponentProps>({
    stateToProps: state => ({
      isInitialConnectionInProgress: state.ledgerWizardState.isInitialConnectionInProgress,
      errorMessage: state.ledgerWizardState.errorMsg,
      isLoginRoute: selectIsLoginRoute(state.router),
    }),
  }),
)(WalletLedgerInitComponent);
