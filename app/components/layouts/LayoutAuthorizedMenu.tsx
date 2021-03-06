import * as cn from "classnames";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

import { TUserType } from "../../lib/api/users/interfaces";
import { selectUserType } from "../../modules/auth/selectors";
import { selectIsActionRequiredSettings } from "../../modules/notifications/selectors";
import { appConnect } from "../../store";
import { invariant } from "../../utils/invariant";
import { appRoutes } from "../AppRouter";
import { InlineIcon } from "../shared/InlineIcon";

import * as iconEdit from "../../assets/img/inline_icons/icon_edit.svg";
import * as iconStart from "../../assets/img/inline_icons/icon_home_active.svg";
import * as iconPortfolio from "../../assets/img/inline_icons/icon_portfolio_inactive.svg";
import * as iconSettings from "../../assets/img/inline_icons/icon_settings_inactive.svg";
import * as iconStats from "../../assets/img/inline_icons/icon_stats.svg";
import * as iconWallet from "../../assets/img/inline_icons/icon_wallet_inactive.svg";
import * as styles from "./LayoutAuthorizedMenu.module.scss";

interface IMenuEntry {
  svgString: string;
  title: string;
  actionRequired?: boolean;
}

interface IStateProps {
  userType?: TUserType;
  actionRequiredSettings: boolean;
}

const MenuEntry: React.SFC<IMenuEntry & NavLinkProps> = ({
  actionRequired,
  title,
  to,
  svgString,
}) => {
  return (
    <NavLink to={to} className={cn(styles.menuItem, svgString)}>
      <span className={styles.icon}>
        <InlineIcon svgIcon={svgString} />
        {actionRequired && <div className={styles.actionIndicator} />}
      </span>
      <span className={styles.name}>{title}</span>
    </NavLink>
  );
};

const InvestorMenu: React.SFC<{ actionRequiredSettings: boolean }> = ({
  actionRequiredSettings,
}) => (
  <div className={styles.menu}>
    <MenuEntry svgString={iconStart} to={appRoutes.dashboard} title="Start" />
    <MenuEntry svgString={iconPortfolio} to="#" title="Portfolio" />
    <MenuEntry svgString={iconWallet} to={appRoutes.wallet} title="Wallet" />
    <MenuEntry
      svgString={iconSettings}
      to={appRoutes.settings}
      title="Settings"
      actionRequired={actionRequiredSettings}
    />
  </div>
);

const IssuerMenu: React.SFC<{ actionRequiredSettings: boolean }> = ({ actionRequiredSettings }) => (
  <div className={styles.menu}>
    <MenuEntry svgString={iconStats} to={appRoutes.dashboard} title="Overview" />
    {/*TODO: This route is not correct */}
    <MenuEntry svgString={iconEdit} to={appRoutes.eto} title="Edit Page" />{" "}
    <MenuEntry
      svgString={iconSettings}
      to={appRoutes.settings}
      title="Settings"
      actionRequired={actionRequiredSettings}
    />
  </div>
);

export const LayoutAuthorizedMenuComponent: React.SFC<IStateProps> = ({ userType, ...props }) => {
  switch (userType) {
    case "investor":
      return <InvestorMenu data-test-id="investor-menu" {...props} />;
    case "issuer":
      return <IssuerMenu data-test-id="issuer-menu" {...props} />;
    default:
      return invariant(false, "Unknown user type");
  }
};

export const LayoutAuthorizedMenu = appConnect<IStateProps, {}>({
  stateToProps: s => ({
    userType: selectUserType(s.auth),
    actionRequiredSettings: selectIsActionRequiredSettings(s),
  }),
})(LayoutAuthorizedMenuComponent);
