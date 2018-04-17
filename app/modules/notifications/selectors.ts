import { IAppState } from "../../store";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../auth/selectors";
import { selectKycRequestStatus } from "./../kyc/selectors";
import { settingsNotification } from "./reducer";

export const selectIsActionRequiredSettings = (state: IAppState): boolean =>
  !selectIsUserEmailVerified(state.auth) ||
  !selectBackupCodesVerified(state.auth) ||
  selectKycRequestStatus(state.kyc) !== "Accepted";

export const selectSettingsNotification = (state: IAppState) =>
  selectIsActionRequiredSettings(state) ? settingsNotification() : undefined;
