import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../../api/httpClient";
import { changeExhibitionRating } from "./exhibitionRatingsApi";
import { updateRatingCaches } from "./updateRatingCaches";
import { RatingSummary } from "./RatingSummary";
import type { RatingState } from "./exhibitionRatingTypes";

const empty: RatingState = { average: null, vote_count: 0, my_rating: null, can_rate: false };
export function ExhibitionRatingControls({ exhibitionId, workId, rating = empty, votingOpen }: {
  exhibitionId: string; workId: string; rating?: RatingState; votingOpen: boolean;
}) {
  const { session } = useAuth(); const { language, t } = useI18n(); const client = useQueryClient(); const id = useId();
  const [current, setCurrent] = useState(rating); const [score, setScore] = useState(rating.my_rating ?? 0);
  const [preview, setPreview] = useState<number | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => { setCurrent(rating); }, [rating]);
  useEffect(() => { setScore(rating.my_rating ?? 0); }, [rating.my_rating]);
  useEffect(() => () => { pending.current?.abort(); }, []);
  const allowed = Boolean(session && votingOpen && current.can_rate);
  async function submit(value: number | null) {
    if (!allowed || pending.current) return;
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 5)) return;
    const controller = new AbortController(); pending.current = controller; setBusy(true); setError(""); setNotice("");
    try {
      const next = await changeExhibitionRating(exhibitionId, workId, value, controller.signal);
      if (controller.signal.aborted) return;
      setCurrent(next); setScore(next.my_rating ?? 0); updateRatingCaches(client, session!.userId, exhibitionId, workId, next);
      setNotice(t(value === null ? "ratings.removed" : "ratings.saved"));
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(t("ratings.failed"));
      if (failure instanceof ApiError && [401, 403, 404, 409].includes(failure.status)) {
        setCurrent(value => ({ ...value, can_rate: false }));
        void client.invalidateQueries({ queryKey: ["exhibition-public-works", session!.userId, exhibitionId] });
      }
    } finally { if (!controller.signal.aborted) { pending.current = null; setBusy(false); } }
  }
  return <section className="exhibition-rating-controls" aria-label={t("ratings.title")}>
    <RatingSummary rating={current}/>
    {current.my_rating !== null && <small>{t("ratings.yours").replace("{score}", String(current.my_rating))}</small>}
    {allowed ? <form onSubmit={event => { event.preventDefault(); void submit(score); }}>
      <fieldset disabled={busy}><legend>{t("ratings.choose")}</legend><div className="exhibition-rating-stars" onPointerLeave={() => setPreview(null)}>
        {[1, 2, 3, 4, 5].map(value => <label key={value} onPointerEnter={event => { if (!busy && event.pointerType !== "touch") setPreview(value); }}>
          <input type="radio" name={id} value={value} checked={score === value} aria-label={t("ratings.stars").replace("{score}", String(value))} onChange={() => { setScore(value); setPreview(null); setNotice(""); }}/>
          <Star size={24} fill={value <= (preview ?? score) ? "currentColor" : "none"} aria-hidden="true"/>
        </label>)}
      </div></fieldset>
      <div className="exhibition-rating-buttons"><button type="submit" disabled={busy || score < 1 || score === current.my_rating}>{t(busy ? "ratings.saving" : current.my_rating === null ? "ratings.submit" : "ratings.change")}</button>
        {current.my_rating !== null && <button type="button" disabled={busy} onClick={() => void submit(null)}>{t("ratings.remove")}</button>}
      </div>
    </form> : !session && votingOpen ? <Link to={`/${language}/login`}>{t("ratings.signIn")}</Link> : <small>{t(!votingOpen || current.unavailable_reason === "closed" ? "ratings.closed" : current.unavailable_reason === "own_work" ? "ratings.own" : current.unavailable_reason === "organizer" ? "ratings.organizer" : "ratings.restricted")}</small>}
    {error && <span role="alert">{error}</span>}{notice && <span role="status">{notice}</span>}
  </section>;
}
