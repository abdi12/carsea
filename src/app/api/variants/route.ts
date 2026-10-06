import { parseIdList } from "@/domain/finder";
import { getDetails, today } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Public catalog data for the comparison and saved list. The request names
// variant ids only; it carries nothing about the buyer.
const MAX_IDS = 60;

export async function GET(request: Request) {
  const ids = parseIdList(
    (new URL(request.url).searchParams.get("ids") ?? "").split(","),
    MAX_IDS,
  );
  try {
    return Response.json(
      { today: today(), variants: await getDetails(ids) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Variant lookup failed:", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
