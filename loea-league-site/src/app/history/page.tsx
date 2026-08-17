import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { Card } from "@/components/Card";
import NewHallOfFameEntryForm from "@/components/NewHallOfFameEntryForm";
import {
  espnHistoryConfigured,
  getEspnHallOfFameHistory,
  type EspnHallOfFameSeason,
} from "@/lib/espn";

type HallOfFameRow = {
  id: string;
  season_year: number;
  champion_team: string | null;
  champion_manager: string | null;
  runner_up_team: string | null;
  runner_up_manager: string | null;
  last_place_team: string | null;
  last_place_manager: string | null;
  punishment: string | null;
  notes: string | null;
};

type MergedSeason = {
  seasonYear: number;
  championTeam: string | null;
  championManager: string | null;
  runnerUpTeam: string | null;
  runnerUpManager: string | null;
  lastPlaceTeam: string | null;
  lastPlaceManager: string | null;
  punishment: string | null;
  notes: string | null;
  fromEspn: boolean;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: entries }, espnHistory] = await Promise.all([
    supabase
      .from("hall_of_fame")
      .select("*")
      .order("season_year", { ascending: false }),
    espnHistoryConfigured()
      ? getEspnHallOfFameHistory().catch(() => [] as EspnHallOfFameSeason[])
      : Promise.resolve([] as EspnHallOfFameSeason[]),
  ]);

  const manualByYear = new Map<number, HallOfFameRow>();
  (entries as HallOfFameRow[] | null)?.forEach((e) =>
