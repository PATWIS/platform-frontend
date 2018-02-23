import { appRoutes } from "../../AppRouter";

const parentRoutePath = appRoutes.recover;

export const recoverRoutes = {
  success: parentRoutePath + "/success",
  seed: parentRoutePath + "/seed",
  help: parentRoutePath + "/help",
};
