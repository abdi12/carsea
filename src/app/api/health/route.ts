import { pingDatabase } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pingDatabase();
    return Response.json({ status: "ok", database: "ok" });
  } catch (error) {
    // Log the cause server-side; never echo connection details to callers.
    console.error("Health check failed:", error);
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }
}
