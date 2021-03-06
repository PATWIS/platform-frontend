import * as queryString from "query-string";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";

import { LocationDescriptor } from "history";
import { RouterState } from "react-router-redux";
import { TUserType } from "../../../lib/api/users/interfaces";
import { selectIsAuthorized, selectUserType } from "../../../modules/auth/selectors";
import { appConnect } from "../../../store";
import { appRoutes } from "../../AppRouter";
import { loginWalletRoutes } from "../../walletSelector/walletRoutes";

interface IStateProps {
  isAuthorized: boolean;
  userType?: TUserType;
  routerState: RouterState;
}

interface IState {
  redirect: boolean;
}

interface IOwnProps {
  path: string;
  exact?: boolean;
  investorComponent?: React.ComponentType<any>;
  issuerComponent?: React.ComponentType<any>;
}

type TProps = IOwnProps & IStateProps;

/**
 * This component will only attempt to redirect on entering the route. So when user gets logged in you need to trigger redirection on your own.
 */
class OnlyAuthorizedRouteComponent extends React.Component<TProps, IState> {
  state = {
    redirect: false,
  };

  componentWillMount(): void {
    this.setState({
      redirect: !this.props.isAuthorized,
    });
  }

  private getRedirectionPath(): LocationDescriptor {
    return {
      pathname: loginWalletRoutes.light,
      search: queryString.stringify({
        redirect:
          this.props.routerState.location!.pathname + this.props.routerState.location!.search,
      }),
    };
  }

  render(): React.ReactNode {
    const {
      investorComponent: InvestorComponent,
      issuerComponent: IssuerComponent,
      ...rest
    } = this.props;
    const { redirect } = this.state;
    const InvestorComponentAsAny = InvestorComponent as any;
    const IssuerComponentAsAny = IssuerComponent as any;

    if (redirect) {
      return <Route {...rest} render={() => <Redirect to={this.getRedirectionPath()} />} />;
    }

    switch (this.props.userType) {
      case "investor":
        return (
          <Route
            {...rest}
            render={() =>
              InvestorComponentAsAny ? (
                <InvestorComponentAsAny />
              ) : (
                <Redirect to={appRoutes.dashboard} />
              )
            }
          />
        );

      case "issuer":
        return (
          <Route
            {...rest}
            render={() =>
              IssuerComponentAsAny ? (
                <IssuerComponentAsAny />
              ) : (
                <Redirect to={appRoutes.dashboard} />
              )
            }
          />
        );
      default:
        throw new Error("Unknown user type!");
    }
  }
}

export const OnlyAuthorizedRoute = appConnect<IStateProps, {}, IOwnProps>({
  stateToProps: s => ({
    isAuthorized: selectIsAuthorized(s.auth),
    userType: selectUserType(s.auth),
    routerState: s.router,
  }),
})(OnlyAuthorizedRouteComponent);
