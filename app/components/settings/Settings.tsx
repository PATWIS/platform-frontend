import * as React from "react";
import { Col, Row } from "reactstrap";

import { selectIsLightWallet } from "../../modules/web3/reducer";
import { appConnect } from "../../store";
import { LayoutAuthorized } from "../layouts/LayoutAuthorized";
import { SectionHeader } from "../shared/SectionHeader";
import { BackupSeedWidget } from "./backupSeed/BackupSeedWidget";
import { ChangeEmail } from "./changeEmail/ChangeEmail";
import { KycStatusWidget } from "./kycStates/KycStatusWidget";
import { VerifyEmailWidget } from "./verifyEmail/VerifyEmailWidget";

interface IProps {
  isLightWallet: boolean;
}

export const SettingsComponent: React.SFC<IProps> = ({ isLightWallet }) => (
  <LayoutAuthorized>
    <Row className="row-gutter-top">
      <Col xs={12}>
        <SectionHeader> Security Settings </SectionHeader>
      </Col>
      <Col lg={4} xs={12}>
        <VerifyEmailWidget />
      </Col>

      {isLightWallet && (
        <Col lg={4} xs={12}>
          <BackupSeedWidget />
        </Col>
      )}

      <Col lg={4} xs={12}>
        <KycStatusWidget />
      </Col>
      <Col xs={12}>
        <SectionHeader> Personal Settings </SectionHeader>
      </Col>
      <Col lg={8} xs={12}>
        <ChangeEmail />
      </Col>
    </Row>
  </LayoutAuthorized>
);

export const Settings = appConnect<IProps, {}>({
  stateToProps: s => ({
    isLightWallet: selectIsLightWallet(s.web3),
  }),
})(SettingsComponent);
