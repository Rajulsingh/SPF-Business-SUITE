import { auth } from "./auth";
import { flocksActions } from "./flocks";
import { dailyRecordsActions } from "./dailyRecords";
import { weightSamplesActions } from "./weightSamples";
import { vaccinationsActions } from "./vaccinations";
import { usersActions } from "./users";

export const server = {
  auth,
  flocks: flocksActions,
  dailyRecords: dailyRecordsActions,
  weightSamples: weightSamplesActions,
  vaccinations: vaccinationsActions,
  users: usersActions,
};
