import { NextResponse } from "next/server";
import { getPublicPayload } from "@/services/api";
export const dynamic = "force-dynamic";
const resources = new Set([
  "portofolios",
  "skills",
  "experiences",
  "documents",
]);
/** Public reads only. No credentials are forwarded and upstream URLs are not user-controlled. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!resources.has(resource))
    return NextResponse.json(
      { success: false, message: "Collection not found." },
      { status: 404 },
    );
  try {
    return NextResponse.json(await getPublicPayload(`/api/${resource}`));
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The data service is unavailable. Please retry.",
      },
      { status: 502 },
    );
  }
}
