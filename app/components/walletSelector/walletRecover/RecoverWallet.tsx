import * as React from "react";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

export const RecoverWallet: React.SFC<{}> = () => {
  return (
    <Row className="mt-5 justify-content-sm-center">
      <Col sm="5">
        <Form className="align-self-end">
          <FormGroup>
            <Label for="copy-backup">Backup phrases</Label>
            <Input
              type="textarea"
              name="backup"
              id="backup-phrase"
              placeholder="Enter your backup phrases here"
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input type="email" name="email" id="email-recover" />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input type="password" name="password" id="recover-password" />
          </FormGroup>
          <FormGroup>
            <Label>Repeat password</Label>
            <Input type="password" name="repeated" id="recov-repeated-pass" />
          </FormGroup>
        </Form>
      </Col>
    </Row>
  );
};
