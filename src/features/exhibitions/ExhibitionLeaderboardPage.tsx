import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { RefreshCw, Star, Trophy } from "lucide-react";
import { mainApiBaseUrl, requestJson } from "../../api/httpClient";
import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "../navigation/AppSidebar";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { ExhibitionArtworkPopup } from "./ExhibitionArtworkPopup";
import { ExhibitionBackButton } from "./ExhibitionBackButton";
import { ExhibitionNavbar } from "./ExhibitionNavbar";
import type { Exhibition } from "./exhibitionApi";
import "./exhibitionLeaderboard.css";

type Entry = { rank: number; work_id: string; title: string; artist_name: string; artist_avatar_url: string | null; image_url: string; type_name_en: string; type_name_ar: string; average: number; vote_count: number };
type Leaderboard = { exhibition: Exhibition; fetched_at: string; started: boolean; voting_open: boolean; total: number; items: Entry[]; next_cursor: number | null };

export function ExhibitionLeaderboardPage() {
  const { exhibitionId = "" } = useParams();
  const { language, t } = useI18n();
  const ar = language === "ar";
  const [opened, setOpened] = useState<string | null>(null);
  // A refresh starts again at page one. Background focus/reconnect events must
  // not move artworks around while the visitor is reading the standings.
  const [revision, setRevision] = useState(0);
  const query = useInfiniteQuery({
    queryKey: ["exhibition-leaderboard", exhibitionId, revision], initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => (await requestJson<Leaderboard>(mainApiBaseUrl, "GET", `/exhibitions/${exhibitionId}/leaderboard?limit=20&cursor=${pageParam}`, { signal })).data,
    getNextPageParam: page => page.next_cursor ?? undefined,
    refetchOnWindowFocus: false, refetchOnReconnect: false, staleTime: Infinity, retry: false,
  });
  const first = query.data?.pages[0];
  const seen = new Set<string>();
  const entries = query.data?.pages.flatMap(page => page.items).filter(item => {
    if (seen.has(item.work_id)) return false;
    seen.add(item.work_id); return true;
  }) ?? [];
  const number = new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const integer = new Intl.NumberFormat(language);
  const label = ar ? "لوحة الترتيب" : "Leaderboard";
  return <main className="exhibitions-page app-page-with-sidebar">
    <AppSidebar/>
    <div className="exhibitions-shell exhibition-leaderboard">
      <ExhibitionNavbar label={label}>
        <ExhibitionBackButton to={`/${language}/exhibition/${exhibitionId}`} label={ar ? "العودة إلى المعرض" : "Back to exhibition"}/>
        <button type="button" disabled={query.isFetching} onClick={() => setRevision(value => value + 1)}><RefreshCw size={17} aria-hidden="true"/>{ar ? "تحديث" : "Refresh"}</button>
      </ExhibitionNavbar>
      <header className="exhibition-leaderboard-heading">
        <Trophy aria-hidden="true"/><h1>{label}</h1>
        {first && <><h2>{first.exhibition.name}</h2>
          <p>{!first.started ? (ar ? "سيظهر الترتيب عند بدء المعرض." : "Standings will be available when the exhibition starts.") : first.voting_open ? (ar ? "تزداد الإثارة" : "It becomes more exciting") : (ar ? "انتهى التصويت." : "Voting is closed.")}</p>
        </>}
      </header>
      {query.isPending && <p role="status">{t("works.loading")}</p>}
      {query.isError && <p role="alert">{t("works.loadFailed")} <button type="button" onClick={() => void query.refetch()}>{t("feed.retry")}</button></p>}
      {first?.started && !entries.length && !query.isError && <p className="exhibition-leaderboard-empty">{ar ? "لا توجد أعمال حصلت على أصوات بعد." : "No artworks have counted votes yet."}</p>}
      <ol className="exhibition-leaderboard-list" aria-label={label}>
        {entries.map(entry => <li key={entry.work_id}>
          <button type="button" className="exhibition-leaderboard-entry" onClick={() => setOpened(entry.work_id)} aria-label={`${ar ? "عرض العمل" : "View artwork"}: ${entry.title}`}>
            <span className="exhibition-leaderboard-rank">#{integer.format(entry.rank)}</span>
            <img className="exhibition-leaderboard-image" src={entry.image_url} alt="" loading="lazy" draggable={false} onContextMenu={event => event.preventDefault()} onDragStart={event => event.preventDefault()}/>
            <span className="exhibition-leaderboard-info"><strong>{entry.title}</strong>
              <span className="exhibition-leaderboard-artist"><ProfileAvatar name={entry.artist_name} url={entry.artist_avatar_url} language={language}/>{entry.artist_name}</span>
              <small>{ar ? entry.type_name_ar : entry.type_name_en}</small>
            </span>
            <span className="exhibition-leaderboard-score"><span><Star size={18} aria-hidden="true"/>{number.format(entry.average)} / 5</span><small>{integer.format(entry.vote_count)} {ar ? "صوت" : entry.vote_count === 1 ? "vote" : "votes"}</small></span>
          </button>
        </li>)}
      </ol>
      {query.hasNextPage && <button type="button" className="primary-button" disabled={query.isFetching} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? t("works.loading") : ar ? "تحميل المزيد" : "Load more"}</button>}
    </div>
    {opened && <ExhibitionArtworkPopup key={opened} workId={opened} onClose={() => setOpened(null)}/>}
  </main>;
}
