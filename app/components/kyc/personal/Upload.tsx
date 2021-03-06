import * as React from "react";

import { compose } from "redux";

import { appConnect } from "../../../store";

import { actions } from "../../../modules/actions";

import { IKycFileInfo, TKycRequestType } from "../../../lib/api/KycApi.interfaces";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { Button } from "../../shared/Buttons";
import { MultiFileUpload } from "../../shared/MultiFileUpload";
import { KycPanel } from "../KycPanel";

interface IStateProps {
  fileUploading: boolean;
  filesLoading: boolean;
  files: IKycFileInfo[];
}

interface IDispatchProps {
  onDone: () => void;
  onDropFile: (file: File) => void;
}

interface IProps {
  layout: TKycRequestType;
}

export const KYCUploadComponent: React.SFC<IProps & IStateProps & IDispatchProps> = props => (
  <KycPanel
    steps={5}
    currentStep={4}
    title="Upload your ID"
    description={
      "Please upload a colored copy of your passport or both sides of ID card for verification."
    }
    hasBackButton={true}
  >
    <MultiFileUpload
      onDropFile={props.onDropFile}
      files={props.files}
      fileUploading={props.fileUploading}
      filesLoading={props.filesLoading}
      layout="individual"
    />
    <div className="p-4 text-center">
      <Button onClick={props.onDone} disabled={!props.files || props.files.length === 0}>
        Submit
      </Button>
    </div>
  </KycPanel>
);

export const KYCPersonalUpload = compose<React.SFC>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      files: state.kyc.individualFiles,
      filesLoading: !!state.kyc.individualFilesLoading,
      fileUploading: !!state.kyc.individualFileUploading,
    }),
    dispatchToProps: dispatch => ({
      onDone: () => dispatch(actions.kyc.kycSubmitIndividualRequest()),
      onDropFile: (file: File) => dispatch(actions.kyc.kycUploadIndividualDocument(file)),
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => dispatch(actions.kyc.kycLoadIndividualDocumentList()),
  }),
)(KYCUploadComponent);
