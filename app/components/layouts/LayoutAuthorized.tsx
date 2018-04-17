import * as React from "react";
import { Col, Row } from "reactstrap";

import { NotificationWidget } from "../dashboard/notification-widget/NotificationWidget";
import { CtaBar } from "../shared/CtaBar";
import { LayoutAuthorizedMenu } from "./LayoutAuthorizedMenu";

import * as styles from "./LayoutAuthorized.module.scss";

export const LayoutAuthorized: React.SFC = ({ children }) => (
  <>
    <div>
      <LayoutAuthorizedMenu />
    </div>
    <div className={styles.layoutAuthorized}>
      <CtaBar
        message={
          "You have filled in all informations and you are able to change them until the ETO is launched."
        }
        ctaText="save draft"
        onClick={() => { }}
      />
      <NotificationWidget />
      <Row>
        <Col className={styles.content}>{children}</Col>
      </Row>
    </div>
  </>
);
