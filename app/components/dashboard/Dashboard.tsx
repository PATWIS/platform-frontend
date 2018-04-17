import * as React from "react";
import { Col, Row } from "reactstrap";
import { LayoutAuthorized } from "../layouts/LayoutAuthorized";
import { SectionHeader } from "../shared/SectionHeader";
import { Tag } from "../shared/Tag";
import { InvestmentPreview } from "./investmentOportunities/InvestmentPreview";
import { MyPortfolioWidget } from "./myPortfolio/MyPortfolioWidget";
import { MyWalletWidget } from "./myWallet/MyWalletWidget";
import { NeufundKpiWidget } from "./NeufundKpiWidget";
import { UserInfo } from "./UserInfo";

const chartPieData = {
  labels: ["Lorem", "Ipsum", "Dit", "Sit", "Amet", "Blah"],
  datasets: [
    {
      data: [100, 50, 20, 40, 50, 12],
      backgroundColor: ["#394651", "#c4c5c6", "#616611", "#9fa914", "#d5e20f", "#0b0e11"],
    },
  ],
};

const chartBarData = {
  labels: ["Lorem", "Ipsum", "Dit", "Sit", "Amet", "Blah"],
  datasets: [
    {
      data: [100, 50, 20, 40, 50, 12],
      backgroundColor: ["#394651", "#c4c5c6", "#616611", "#9fa914", "#d5e20f", "#0b0e11"],
    },
  ],
};

export const Dashboard = () => (
  <LayoutAuthorized>
    <Row>
      <Col lg={8} xs={12}>
        <MyPortfolioWidget className="h-100" />
      </Col>
      <Col>
        <MyWalletWidget className="h-100" />
      </Col>
    </Row>
    <Row className="mt-4 mb-4">
      <Col lg={8} xs={12}>
        <NeufundKpiWidget
          date="12 Sep. 2018"
          tokenHolders={12}
          investorsNum={5}
          etosNum={20}
          currency="eur"
          totalCapitalDeployed={"5" + "0".repeat(26)}
          platformPortfolioValue={"2" + "0".repeat(22)}
          chartBarData={chartBarData}
          chartPieData={chartPieData}
          vcAccessible={"2" + "0".repeat(26)}
          totalProceeds={"2" + "0".repeat(24)}
          totalProceedsToken={"2" + "0".repeat(20)}
        />
      </Col>
    </Row>
    <SectionHeader>
      investment opportunities
      <Tag className="ml-3" color="green" layout="ghost" size="small" text="1 new" />
    </SectionHeader>
    <Row className="py-4">
      <Col xs={12} className="pb-2">
        <InvestmentPreview
          linkToDetails="#0"
          moneyGoal={"400€"}
          currentValuation={"4000€"}
          tokenPrice={"2€"}
          neuInvestorsNum={500}
          startingOn="22.12.2019"
          handleEmailSend={() => {}}
          endInDays={25}
          company={"Superawesome startup 2"}
          hasStarted={true}
          detailsLink="#0"
          preFoundingStatus={{
            money: "€ 50M",
            investorsNum: 5,
            leadInvestors: ["abc", "zxc"],
          }}
          tags={[
            {
              text: "tag 1",
              to: "#0",
            },
            {
              text: "tag 2",
            },
          ]}
        />
      </Col>
      <Col xs={12} className="pb-2">
        <InvestmentPreview
          linkToDetails="#0"
          moneyGoal={"400€"}
          currentValuation={"4000€"}
          tokenPrice={"2€"}
          neuInvestorsNum={500}
          startingOn="22.12.2019"
          handleEmailSend={() => {}}
          endInDays={25}
          company={"Superawesome startup one"}
          hasStarted={false}
          detailsLink="#0"
          preFoundingStatus={{
            money: "€ 50M",
            investorsNum: 5,
            leadInvestors: ["abc", "zxc"],
          }}
          tags={[
            {
              text: "tag 1",
              to: "#0",
            },
            {
              text: "tag 2",
            },
          ]}
        />
      </Col>
    </Row>
    <br />
    <br />
    <br />
    <br />
    <UserInfo />
  </LayoutAuthorized>
);
