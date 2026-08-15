export type EspnTeam = {
  id: number;
  name: string;
  abbrev: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
  logo?: string;
};

export type EspnStandings = {
  teams: EspnTeam[];
  seasonYear: number;
  currentWeek?: number;
};

type EspnLeagueResponse = {
  teams?: {
    id: number;
    name?: string;
    location?: string;
    nickname?: string;
    abbrev: string;
    logo?: string;
    playoffSeed?: number;
    record?: {
      overall?: {
        wins?: number;
        losses?: number;
        ties?: number;
        pointsFor?: number;
        pointsAgainst?: number;
      };
    };
  }[];
  status?: { currentMatchupPeriod?: number };
};

export function espnConfigured() {
  return Boolean(process.env.ESPN_LEAGUE_ID && process.env.ESPN_SEASON_YEAR);
}

export async function getEspnStandings(): Promise<EspnStandings> {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const seasonYear = process.env.ESPN_SEASON_YEAR;
  const swid = process.env.ESPN_SWID;
  const espnS2 = process.env.ESPN_S2;

  if (!leagueId || !seasonYear) {
    throw new Error("ESPN league not configured");
  }

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonYear}/segments/0/leagues/${leagueId}?view=mTeam&view=mStandings`;

  const headers: Record<string, string> = {};
  if (swid && espnS2) {
    headers["Cookie"] = `SWID=${swid}; espn_s2=${espnS2}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 }, // refresh every 5 minutes
  });

  if (!res.ok) {
    throw new Error(
      `ESPN API returned ${res.status}. If this is a private league, double-check ESPN_SWID / ESPN_S2.`
    );
  }

  const data: EspnLeagueResponse = await res.json();

  const teams: EspnTeam[] = (data.teams ?? []).map((t) => {
    const record = t.record?.overall ?? {};
    return {
      id: t.id,
      name: t.name ?? `${t.location ?? ""} ${t.nickname ?? ""}`.trim(),
      abbrev: t.abbrev,
      wins: record.wins ?? 0,
      losses: record.losses ?? 0,
      ties: record.ties ?? 0,
      pointsFor: record.pointsFor ?? 0,
      pointsAgainst: record.pointsAgainst ?? 0,
      rank: t.playoffSeed ?? 0,
      logo: t.logo,
    };
  });

  teams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return {
    teams,
    seasonYear: Number(seasonYear),
    currentWeek: data.status?.currentMatchupPeriod,
  };
}
