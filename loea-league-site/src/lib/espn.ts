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

export type EspnHallOfFameSeason = {
  seasonYear: number;
  championTeam: string | null;
  runnerUpTeam: string | null;
  lastPlaceTeam: string | null;
};

type EspnHistoryTeam = {
  id: number;
  name?: string;
  location?: string;
  nickname?: string;
  rankCalculatedFinal?: number;
  playoffSeed?: number;
};

type EspnHistorySeasonResponse = {
  teams?: EspnHistoryTeam[];
  seasonId?: number;
};

export function espnHistoryConfigured() {
  return Boolean(
    process.env.ESPN_LEAGUE_ID &&
      process.env.ESPN_HISTORY_START_YEAR &&
      process.env.ESPN_SEASON_YEAR
  );
}

function espnHeaders(): Record<string, string> {
  const swid = process.env.ESPN_SWID;
  const espnS2 = process.env.ESPN_S2;
  const headers: Record<string, string> = {};
  if (swid && espnS2) {
    headers["Cookie"] = `SWID=${swid}; espn_s2=${espnS2}`;
  }
  return headers;
}

async function fetchEspnSeason(
  leagueId: string,
  year: number
): Promise<EspnHallOfFameSeason | null> {
  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${year}&view=mTeam&view=mStandings`;

  const res = await fetch(url, {
    headers: espnHeaders(),
    next: { revalidate: 3600 }, // history rarely changes — refresh hourly
  });
  if (!res.ok) return null;

  const raw = await res.json();
  const data: EspnHistorySeasonResponse | undefined = Array.isArray(raw)
    ? raw[0]
    : raw;
  const teams = data?.teams;
  if (!teams || teams.length === 0) return null;

  const teamName = (t: EspnHistoryTeam) =>
    (t.name ?? `${t.location ?? ""} ${t.nickname ?? ""}`.trim()) || "Unknown";

  const ranked = [...teams].sort((a, b) => {
    const rankA = a.rankCalculatedFinal ?? a.playoffSeed ?? 999;
    const rankB = b.rankCalculatedFinal ?? b.playoffSeed ?? 999;
    return rankA - rankB;
  });

  const champion = ranked[0];
  const runnerUp = ranked[1];
  const lastPlace = ranked[ranked.length - 1];

  return {
    seasonYear: year,
    championTeam: champion ? teamName(champion) : null,
    runnerUpTeam: runnerUp ? teamName(runnerUp) : null,
    lastPlaceTeam:
      lastPlace && lastPlace !== champion ? teamName(lastPlace) : null,
  };
}

/**
 * Fetches final standings (champion / runner-up / last place) for every
 * completed season from ESPN_HISTORY_START_YEAR up to (but not including)
 * the current ESPN_SEASON_YEAR. Seasons ESPN has no data for are silently
 * skipped rather than failing the whole page.
 */
export async function getEspnHallOfFameHistory(): Promise<
  EspnHallOfFameSeason[]
> {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const startYear = Number(process.env.ESPN_HISTORY_START_YEAR);
  const currentSeason = Number(process.env.ESPN_SEASON_YEAR);

  if (!leagueId || !startYear || !currentSeason) return [];

  const endYear = currentSeason - 1;
  if (endYear < startYear) return [];

  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const results = await Promise.allSettled(
    years.map((year) => fetchEspnSeason(leagueId, year))
  );

  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((s): s is EspnHallOfFameSeason => s !== null && s.championTeam !== null)
    .sort((a, b) => b.seasonYear - a.seasonYear);
}

export type EspnRosterPlayer = {
  playerId: number;
  name: string;
  slot: string;
  isStarter: boolean;
  injuryStatus?: string;
};

const LINEUP_SLOT_LABELS: Record<number, string> = {
  0: "QB",
  1: "QB",
  2: "RB",
  3: "RB/WR",
  4: "WR",
  5: "WR/TE",
  6: "TE",
  7: "OP",
  16: "D/ST",
  17: "K",
  20: "Bench",
  21: "IR",
  23: "FLEX",
};

const BENCH_SLOT_IDS = new Set([20, 21]);

type EspnRosterEntry = {
  lineupSlotId: number;
  playerPoolEntry?: {
    player?: {
      id?: number;
      fullName?: string;
      injuryStatus?: string;
    };
  };
};

type EspnRosterTeam = {
  id: number;
  roster?: { entries?: EspnRosterEntry[] };
};

type EspnRosterResponse = {
  teams?: EspnRosterTeam[];
};

/**
 * Fetches a single team's current roster (starters + bench) for the
 * configured season. Returns an empty array if the team has no roster yet
 * (e.g. before the draft happens), or null if ESPN isn't configured / the
 * request failed outright.
 */
export async function getEspnRoster(
  teamId: number
): Promise<EspnRosterPlayer[] | null> {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const seasonYear = process.env.ESPN_SEASON_YEAR;
  if (!leagueId || !seasonYear) return null;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonYear}/segments/0/leagues/${leagueId}?view=mRoster`;

  const res = await fetch(url, {
    headers: espnHeaders(),
    next: { revalidate: 300 }, // refresh every 5 minutes
  });
  if (!res.ok) return null;

  const data: EspnRosterResponse = await res.json();
  const team = data.teams?.find((t) => t.id === teamId);
  if (!team) return null;

  const entries = team.roster?.entries ?? [];

  return entries
    .map((entry) => {
      const player = entry.playerPoolEntry?.player;
      return {
        playerId: player?.id ?? 0,
        name: player?.fullName ?? "Unknown Player",
        slot: LINEUP_SLOT_LABELS[entry.lineupSlotId] ?? "—",
        isStarter: !BENCH_SLOT_IDS.has(entry.lineupSlotId),
        injuryStatus:
          player?.injuryStatus && player.injuryStatus !== "ACTIVE"
            ? player.injuryStatus
            : undefined,
      };
    })
    .sort((a, b) => (a.isStarter === b.isStarter ? 0 : a.isStarter ? -1 : 1));
}

export async function getEspnStandings(): Promise<EspnStandings> {
  const leagueId = process.env.ESPN_LEAGUE_ID;
  const seasonYear = process.env.ESPN_SEASON_YEAR;

  if (!leagueId || !seasonYear) {
    throw new Error("ESPN league not configured");
  }

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonYear}/segments/0/leagues/${leagueId}?view=mTeam&view=mStandings`;

  const res = await fetch(url, {
    headers: espnHeaders(),
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
