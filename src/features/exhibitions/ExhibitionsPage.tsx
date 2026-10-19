import { artworkImageProtection } from "../works/artworkImageProtection";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trophy,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "../navigation/AppSidebar";
import { ExhibitionCard } from "./ExhibitionCard";
import { ExhibitionToolbar } from "./ExhibitionToolbar";
import { DeleteExhibitionDialog } from "./DeleteExhibitionDialog";
import {
  listExhibitions,
  getExhibition,
  saveExhibition,
  getSubmissions,
  getEligibleExhibitions,
  uploadBanner,
} from "./exhibitionApi";
import type {
  Exhibition,
  ExhibitionInput,
  Submission,
} from "./exhibitionApi";

function localDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function ExhibitionsPage() {
  const { session } = useAuth();
  const { language, t } = useI18n();
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const canDelete = Boolean(session && ["admin", "system_administrator"].includes(session.role));
  const manage = Boolean(
    session &&
    ["supervisor", "admin", "system_administrator"].includes(session.role),
  );
  const [items, setItems] = useState<Exhibition[]>([]);
  const [selected, setSelected] = useState<Exhibition | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [pastCursor, setPastCursor] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subCursor, setSubCursor] = useState<number | null>(null);
  const scope = "public";
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ExhibitionInput>({
    name: "",
    description: "",
    event_at: "",
    participation_opens_at: "",
    participation_closes_at: "",
  });
  const [banner, setBanner] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<string | undefined>();
  const started = Boolean(selected && Date.parse(selected.event_at) <= now);
  useEffect(() => {
    if (editing)
      document
        .querySelector(".exhibition-editor")
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [editing]);
  function failure(cause: unknown) {
    setError(cause instanceof Error ? cause.message : t("exhibitions.failed"));
  }
  async function loadSections() {
    const [upcoming, past] = await Promise.all([
      listExhibitions(0, "upcoming"),
      listExhibitions(0, "past"),
    ]);
    return {
      items: [
        ...new Map(
          [...upcoming.items, ...past.items].map((item) => [
            item.exhibition_id,
            item,
          ]),
        ).values(),
      ],
      upcomingCursor: upcoming.next_cursor,
      pastCursor: past.next_cursor,
    };
  }
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [exhibitionId]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setSelected(null);
    setEditing(false);
    const request = exhibitionId
      ? getExhibition(exhibitionId).then((value) => {
          if (active) setSelected(value);
        })
      : loadSections().then((page) => {
          if (active) {
            setItems(page.items);
            setCursor(page.upcomingCursor);
            setPastCursor(page.pastCursor);
          }
        });
    request
      .catch((cause) => {
        if (active) failure(cause);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [exhibitionId]);
  useEffect(() => {
    if (!exhibitionId || !started) return;
    let active = true;
    setSubmissions([]);
    setSubCursor(null);
    getSubmissions(exhibitionId, scope)
      .then((page) => {
        if (active) {
          setSubmissions(page.items);
          setSubCursor(page.next_cursor);
        }
      })
      .catch((cause) => {
        if (active) failure(cause);
      });
    return () => {
      active = false;
    };
  }, [exhibitionId, scope, started]);
  useEffect(() => {
    setAvailable(false);
    if (!session || !exhibitionId) return;
    let active = true;
    getEligibleExhibitions(0, undefined, exhibitionId).then(page => {
      if (active) setAvailable(page.items.length > 0);
    }).catch(cause => { if (active) failure(cause); });
    return () => { active = false; };
  }, [session, exhibitionId, selected?.participation_open]);
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (cause) {
      failure(cause);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    if (!exhibitionId) return;
    const [details, page] = await Promise.all([
      getExhibition(exhibitionId),
      getSubmissions(exhibitionId, scope),
    ]);
    setSelected(details);
    setSubmissions(page.items);
    setSubCursor(page.next_cursor);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const data = {
        ...form,
        event_at: new Date(form.event_at).toISOString(),
        participation_opens_at: new Date(
          form.participation_opens_at,
        ).toISOString(),
        participation_closes_at: new Date(
          form.participation_closes_at,
        ).toISOString(),
      };
      const saved = await saveExhibition(
        data,
        selected?.exhibition_id ?? createdId,
      );
      setCreatedId(saved.exhibition_id);
      if (banner) await uploadBanner(saved.exhibition_id, banner);
      setEditing(false);
      setBanner(null);
      setCreatedId(undefined);
      setNotice(t("exhibitions.saved"));
      if (exhibitionId) await refresh();
      else {
        const page = await loadSections();
        setItems(page.items);
        setCursor(page.upcomingCursor);
        setPastCursor(page.pastCursor);
      }
    });
  }
  function edit() {
    setCreatedId(undefined);
    setBanner(null);
    setForm(
      selected
        ? {
            name: selected.name,
            description: selected.description,
            event_at: localDate(selected.event_at),
            participation_opens_at: localDate(selected.participation_opens_at),
            participation_closes_at: localDate(
              selected.participation_closes_at,
            ),
          }
        : {
            name: "",
            description: "",
            event_at: "",
            participation_opens_at: "",
            participation_closes_at: "",
          },
    );
    setEditing(true);
  }
  const date = (value: string) =>
    new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  return (
    <main className="exhibitions-page app-page-with-sidebar">
      <AppSidebar />
      <div className="exhibitions-shell">
        {!selected && <header className="exhibitions-heading">
          <div>
            <Trophy aria-hidden="true" />
            <h1>{t("exhibitions.title")}</h1>
          </div>
          {manage && !exhibitionId && (
            <button className="primary-button" disabled={busy} onClick={edit}>
              <Plus size={18} />
              {t(selected ? "exhibitions.edit" : "exhibitions.create")}
            </button>
          )}
        </header>}
        {selected && <ExhibitionToolbar id={selected.exhibition_id} manage={manage} signedIn={Boolean(session)} available={available && selected.participation_open} busy={busy} onEdit={edit} onDelete={canDelete ? () => setDeleting(true) : undefined}/>}
        {deleting && selected && canDelete && <DeleteExhibitionDialog id={selected.exhibition_id} name={selected.name} onClose={() => setDeleting(false)} onDeleted={() => { setDeleting(false); navigate(`/${language}/exhibition`, { replace: true }); }}/>}
        {error && (
          <p className="form-message error-message" role="alert">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        {loading ? (
          <p role="status">{t("exhibitions.loading")}</p>
        ) : !selected && !exhibitionId ? (
          <>
            <p>{t("exhibitions.intro")}</p>
            {(["upcoming", "past"] as const).map((period) => {
              const past = period === "past";
              const entries = items
                .filter(
                  (item) => new Date(item.event_at).getTime() <= now === past,
                )
                .sort((a, b) =>
                  past
                    ? Date.parse(b.event_at) - Date.parse(a.event_at)
                    : Date.parse(a.event_at) - Date.parse(b.event_at),
                );
              const next = past ? pastCursor : cursor;
              return (
                <section
                  className="exhibition-period-section"
                  key={period}
                  aria-labelledby={`exhibition-${period}-title`}
                >
                  <header className="exhibition-period-heading">
                    <span>
                      <CalendarDays size={20} aria-hidden="true" />
                      <h2 id={`exhibition-${period}-title`}>
                        {t(past ? "exhibitions.past" : "exhibitions.upcoming")}
                      </h2>
                    </span>
                    <p>
                      {t(
                        past
                          ? "exhibitions.pastHint"
                          : "exhibitions.upcomingHint",
                      )}
                    </p>
                  </header>
                  <div className="exhibitions-grid">
                    {entries.map((item) => (
                      <ExhibitionCard
                        key={item.exhibition_id}
                        exhibition={item}
                        past={past}
                      />
                    ))}
                  </div>
                  {!entries.length && (
                    <p className="exhibition-section-empty">
                      {t(
                        past ? "exhibitions.noPast" : "exhibitions.noUpcoming",
                      )}
                    </p>
                  )}
                  {next !== null && (
                    <button
                      disabled={busy}
                      className="pagination-load-more"
                      aria-label={t(
                        past
                          ? "exhibitions.morePast"
                          : "exhibitions.moreUpcoming",
                      )}
                      onClick={() =>
                        void run(async () => {
                          const page = await listExhibitions(next, period);
                          setItems((current) => [
                            ...new Map(
                              [...current, ...page.items].map((item) => [
                                item.exhibition_id,
                                item,
                              ]),
                            ).values(),
                          ]);
                          if (past) setPastCursor(page.next_cursor);
                          else setCursor(page.next_cursor);
                        })
                      }
                    >
                      {t("exhibitions.more")}
                    </button>
                  )}
                </section>
              );
            })}
          </>
        ) : (
          selected && (
            <>
              <ExhibitionCard exhibition={selected} past={Date.parse(selected.event_at) <= Date.now()} detail>
              <section className="exhibition-summary">
                <dl>
                  <div>
                    <dt>{t("exhibitions.eventDate")}</dt>
                    <dd>{date(selected.event_at)}</dd>
                  </div>
                  <div>
                    <dt>{t("exhibitions.opens")}</dt>
                    <dd>{date(selected.participation_opens_at)}</dd>
                  </div>
                  <div>
                    <dt>{t("exhibitions.closes")}</dt>
                    <dd>{date(selected.participation_closes_at)}</dd>
                  </div>
                </dl>
              </section>
              </ExhibitionCard>
              {Date.parse(selected.event_at) <= now && <section className="exhibition-public-works" aria-label={t("exhibitions.works")}>
              <div className="exhibitions-grid">
                {submissions.map((item) => (
                  <article className="exhibition-card" key={item.submission_id}>
                    <Link to={`/${language}?work=${item.work_id}`}>
                      <img {...artworkImageProtection}
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                      />
                    </Link>
                    <div>
                      <h3>{item.title}</h3>
                      <Link to={`/${language}/profile/${item.user_id}`}>
                        {item.artist_name}
                      </Link>
                      <p className={`exhibition-status ${item.status}`}>
                        {t(
                          item.status === "approved"
                            ? "exhibitions.approved"
                            : item.status === "rejected"
                              ? "exhibitions.rejected"
                              : "exhibitions.pending",
                        )}
                      </p>
                      {item.rejection_reason && <p>{item.rejection_reason}</p>}
                    </div>
                  </article>
                ))}
              </div>
              {!submissions.length && <p>{t("exhibitions.noSubmissions")}</p>}
              {subCursor !== null && (
                <button
                  className="pagination-load-more"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const page = await getSubmissions(
                        exhibitionId!,
                        scope,
                        subCursor,
                      );
                      setSubmissions((current) => [...current, ...page.items]);
                      setSubCursor(page.next_cursor);
                    })
                  }
                >
                  {t("exhibitions.more")}
                </button>
              )}
              </section>}
            </>
          )
        )}
        {editing && (
          <section className="exhibition-editor">
            <h2>{t(selected ? "exhibitions.edit" : "exhibitions.create")}</h2>
            <form className="form-stack" onSubmit={(event) => void save(event)}>
              <label>
                {t("exhibitions.name")}
                <input
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
              <label>
                {t("exhibitions.description")}
                <textarea
                  required
                  maxLength={5000}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              {(
                [
                  "event_at",
                  "participation_opens_at",
                  "participation_closes_at",
                ] as const
              ).map((field, index) => (
                <label key={field}>
                  {t(
                    index === 0
                      ? "exhibitions.eventDate"
                      : index === 1
                        ? "exhibitions.opens"
                        : "exhibitions.closes",
                  )}
                  <input
                    required
                    type="datetime-local"
                    value={form[field]}
                    onChange={(event) =>
                      setForm({ ...form, [field]: event.target.value })
                    }
                  />
                </label>
              ))}
              <small>{t("exhibitions.dateHint")}</small>
              <label>
                {t("exhibitions.banner")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setBanner(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <div className="exhibition-actions">
                <button disabled={busy} className="primary-button">
                  {t(busy ? "exhibitions.saving" : "exhibitions.save")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(false)}
                >
                  {t("exhibitions.cancel")}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
