import "server-only";

import { getDb } from "@/db/client";
import {
  type CatalogScope,
  loadServiceCenters,
  loadVariantDetails,
  loadVariantSummaries,
} from "@/db/catalog-queries";
import { toIsoDate } from "@/domain/provenance";

// The app's single view of the catalog: the launch region, as of today.
// Jakarta is UTC+7, so "today" is taken there rather than on the server.
const scope = (): CatalogScope => ({
  region: "jabodetabek",
  today: toIsoDate(new Date(Date.now() + 7 * 3_600_000)),
});

export const today = () => scope().today;
export const getSummaries = () => loadVariantSummaries(getDb(), scope());
export const getDetails = (ids?: string[]) => loadVariantDetails(getDb(), scope(), ids);
export const getDetail = async (id: string) => (await getDetails([id]))[0] ?? null;
export const getServiceCenters = () => loadServiceCenters(getDb(), scope());
