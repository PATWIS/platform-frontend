import * as cn from "classnames";
import * as React from "react";
import { Col, Row } from "reactstrap";

import { selectNeuBalanceEuroAmount } from "../../../modules/wallet/selectors";
import { appConnect } from "../../../store";
import { CommonHtmlProps } from "../../../types";
import { Button } from "../../shared/Buttons";
import { LoadingIndicator } from "../../shared/LoadingIndicator";
import { PanelDark } from "../../shared/PanelDark";
import { WarningAlert } from "../../shared/WarningAlert";
import { MyNeuWidget } from "./MyNeuWidget";

import * as arrowRight from "../../../assets/img/inline_icons/arrow_right.svg";
import * as styles from "./MyPortfolioWidget.module.scss";

type TOwnProps = CommonHtmlProps;

interface IBodyProps {
  error?: string;
  data?: {
    balanceNeu: string;
    balanceEur: string;
  };
}

interface IStateProps extends IBodyProps {
  isLoading: boolean;
}

type IProps = TOwnProps & IStateProps;

export const MyPortfolioWidgetComponentBody: React.SFC<IBodyProps> = ({ error, data }) => {
  if (error) {
    return <WarningAlert>{error}</WarningAlert>;
  }

  return (
    <>
      <Col xl={8} md={7} xs={12} className="mt-5 text-center mb-4 ">
        <h3>Welcome to NEUFUND!</h3>
        <p>You have no assets in your portfolio yet.</p>
        <Button layout="secondary" iconPosition="icon-after" svgIcon={arrowRight}>
          Investment Opportunities
        </Button>
      </Col>
      <Col xl={4} md={5} xs={12} className="mt-3">
        <MyNeuWidget balanceNeu={data!.balanceNeu} balanceEur={data!.balanceEur} />
      </Col>
    </>
  );
};

export const MyPortfolioWidgetComponent: React.SFC<IProps> = ({
  className,
  style,
  isLoading,
  error,
  data,
}) => {
  return (
    <PanelDark headerText="My portfolio" className={className} style={style}>
      <Row className={cn(styles.main, "pb-3")}>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <MyPortfolioWidgetComponentBody data={data} error={error} />
        )}
      </Row>
    </PanelDark>
  );
};

export const MyPortfolioWidget = appConnect<IStateProps, {}, TOwnProps>({
  stateToProps: s => ({
    isLoading: s.wallet.loading,
    error: s.wallet.error,
    data: s.wallet.data && {
      balanceNeu: s.wallet.data.neuBalance,
      balanceEur: selectNeuBalanceEuroAmount(s.wallet.data),
    },
  }),
})(MyPortfolioWidgetComponent);
