import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEspnRoster } from "@/lib/espn";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const teamIdParam = request.nextUrl.searchParams.get("teamId");
  const teamId = teamIdParam ? Number(teamIdParam) : NaN;

  if (!teamIdParam || Number.isNaN(teamId)) {
    return NextResponse.json({ error: "Missing teamId." }, { status: 400 });
  }

  const roster = await getEspnRoster(teamId);

  if (roster === null) {
    return NextResponse.json(
      { error: "Couldn't load that lineup from ESPN." },
      { status: 502 }
    );
  }

  return NextResponse.json({ roster });
}
