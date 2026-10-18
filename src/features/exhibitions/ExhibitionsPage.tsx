import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trophy,
  Upload,
  Check,
  X,
  Ban,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "../navigation/AppSidebar";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { ExhibitionCard } from "./ExhibitionCard";
import { ExhibitionCountdown } from "./ExhibitionCountdown";
import { getMyWorks } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import {
  listExhibitions,
  getExhibition,
  saveExhibition,
  getSubmissions,
  submitWork,
  reviewSubmission,
  blockParticipant,
  unblockParticipant,
  getBlocks,
  uploadBanner,
} from "./exhibitionApi";
import type {
  Exhibition,
  ExhibitionInput,
  Submission,
  Block,
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
  const [scope, setScope] = useState("public");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockCursor, setBlockCursor] = useState<number | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [workCursor, setWorkCursor] = useState<string | null>(null);
  const [workId, setWorkId] = useState("");
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
  const [action, setAction] = useState<{
    kind: "reject" | "block";
    item: Submission;
  } | null>(null);
  const [reason, setReason] = useState("");
  usePageScrollLock(action !== null);
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
    if (exhibitionId) return;
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
    if (!exhibitionId) return;
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
  }, [exhibitionId, scope]);
  useEffect(() => {
    if (!session || !exhibitionId) return;
    let active = true;
    getMyWorks()
      .then((page) => {
        if (active) {
          setWorks(page.items);
          setWorkCursor(
            page.next_cursor === null ? null : String(page.next_cursor),
          );
        }
      })
      .catch((cause) => {
        if (active) failure(cause);
      });
    return () => {
      active = false;
    };
  }, [session, exhibitionId]);
  useEffect(() => {
    if (!manage || !exhibitionId) return;
    let active = true;
    getBlocks(exhibitionId)
      .then((page) => {
        if (active) {
          setBlocks(page.items);
          setBlockCursor(page.next_cursor);
        }
      })
      .catch((cause) => {
        if (active) failure(cause);
      });
    return () => {
      active = false;
    };
  }, [manage, exhibitionId]);
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
  async function performAction(event: FormEvent) {
    event.preventDefault();
    if (!action || !exhibitionId) return;
    await run(async () => {
      if (action.kind === "reject")
        await reviewSubmission(
          exhibitionId,
          action.item.submission_id,
          "rejected",
          reason,
        );
      else {
        await blockParticipant(exhibitionId, action.item.user_id, reason);
        const page = await getBlocks(exhibitionId);
        setBlocks(page.items);
        setBlockCursor(page.next_cursor);
      }
      setAction(null);
      setReason("");
      await refresh();
    });
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
        <header className="exhibitions-heading">
          <div>
            <Trophy aria-hidden="true" />
            <h1>{selected?.name ?? t("exhibitions.title")}</h1>
          </div>
          {manage && (
            <button className="primary-button" disabled={busy} onClick={edit}>
              <Plus size={18} />
              {t(selected ? "exhibitions.edit" : "exhibitions.create")}
            </button>
          )}
        </header>
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
              <Link to={`/${language}/exhibition`}>
                {t("exhibitions.back")}
              </Link>
              {selected.banner_url && (
                <img
                  className="exhibition-hero-banner"
                  src={selected.banner_url}
                  alt={selected.name}
                />
              )}
              <section className="exhibition-summary">
                <ExhibitionCountdown eventAt={selected.event_at} />
                <p>{selected.description}</p>
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
                <span
                  className={`exhibition-status ${selected.participation_open ? "open" : ""}`}
                >
                  {t(
                    selected.participation_open
                      ? "exhibitions.open"
                      : "exhibitions.closed",
                  )}
                </span>
              </section>
              {session ? (
                <section className="exhibition-participation">
                  <h2>{t("exhibitions.participate")}</h2>
                  <p>{t("exhibitions.pendingHint")}</p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(async () => {
                        await submitWork(exhibitionId!, workId);
                        setNotice(t("exhibitions.submitted"));
                        setScope("mine");
                        await refresh();
                      });
                    }}
                  >
                    <label>
                      <span>{t("exhibitions.selectWork")}</span>
                      <select
                        required
                        value={workId}
                        onChange={(event) => setWorkId(event.target.value)}
                      >
                        <option value="">{t("exhibitions.selectWork")}</option>
                        {works.map((work) => (
                          <option key={work.work_id} value={work.work_id}>
                            {work.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="primary-button"
                      disabled={busy || !selected.participation_open || !workId}
                    >
                      {t("exhibitions.submit")}
                    </button>
                  </form>
                  {workCursor && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const page = await getMyWorks(workCursor);
                          setWorks((current) => [...current, ...page.items]);
                          setWorkCursor(
                            page.next_cursor === null
                              ? null
                              : String(page.next_cursor),
                          );
                        })
                      }
                    >
                      {t("exhibitions.moreWorks")}
                    </button>
                  )}
                  <Link
                    className="exhibition-upload-link"
                    to={`/${language}/upload?exhibition=${selected.exhibition_id}`}
                  >
                    <Upload size={17} />
                    {t("exhibitions.uploadNew")}
                  </Link>
                </section>
              ) : (
                <Link to={`/${language}/login`}>{t("exhibitions.login")}</Link>
              )}
              <nav
                className="exhibition-tabs"
                aria-label={t("exhibitions.works")}
              >
                <button
                  aria-pressed={scope === "public"}
                  onClick={() => setScope("public")}
                >
                  {t("exhibitions.approved")}
                </button>
                {session && (
                  <button
                    aria-pressed={scope === "mine"}
                    onClick={() => setScope("mine")}
                  >
                    {t("exhibitions.mySubmissions")}
                  </button>
                )}
                {manage && (
                  <button
                    aria-pressed={scope === "manage"}
                    onClick={() => setScope("manage")}
                  >
                    {t("exhibitions.reviewQueue")}
                  </button>
                )}
              </nav>
              <div className="exhibitions-grid">
                {submissions.map((item) => (
                  <article className="exhibition-card" key={item.submission_id}>
                    <Link to={`/${language}?work=${item.work_id}`}>
                      <img
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
                      {manage && scope === "manage" && (
                        <footer>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await reviewSubmission(
                                  exhibitionId!,
                                  item.submission_id,
                                  "approved",
                                );
                                await refresh();
                              })
                            }
                          >
                            <Check size={16} />
                            {t("exhibitions.approve")}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => {
                              setReason("");
                              setAction({ kind: "reject", item });
                            }}
                          >
                            <X size={16} />
                            {t("exhibitions.reject")}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => {
                              setReason("");
                              setAction({ kind: "block", item });
                            }}
                          >
                            <Ban size={16} />
                            {t("exhibitions.block")}
                          </button>
                        </footer>
                      )}
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
              {manage && (
                <section className="exhibition-blocks">
                  <h2>{t("exhibitions.blocked")}</h2>
                  {blocks.map((item) => (
                    <div key={item.user_id}>
                      <Link to={`/${language}/profile/${item.user_id}`}>
                        {item.full_name}
                      </Link>
                      <p>{item.reason}</p>
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await unblockParticipant(
                              exhibitionId!,
                              item.user_id,
                            );
                            const page = await getBlocks(exhibitionId!);
                            setBlocks(page.items);
                            setBlockCursor(page.next_cursor);
                            await refresh();
                          })
                        }
                      >
                        {t("exhibitions.unblock")}
                      </button>
                    </div>
                  ))}
                  {!blocks.length && <p>{t("exhibitions.noBlocks")}</p>}
                  {blockCursor !== null && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const page = await getBlocks(
                            exhibitionId!,
                            blockCursor,
                          );
                          setBlocks((current) => [...current, ...page.items]);
                          setBlockCursor(page.next_cursor);
                        })
                      }
                    >
                      {t("exhibitions.more")}
                    </button>
                  )}
                </section>
              )}
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
        {action && (
          <div
            className="profile-connections-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget && !busy)
                setAction(null);
            }}
          >
            <section
              className="exhibition-action-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="exhibition-action-title"
            >
              <h2 id="exhibition-action-title">
                {t(
                  action.kind === "reject"
                    ? "exhibitions.reject"
                    : "exhibitions.block",
                )}
              </h2>
              <form
                className="form-stack"
                onSubmit={(event) => void performAction(event)}
              >
                <label>
                  {t("exhibitions.reason")}
                  <textarea
                    autoFocus
                    required
                    maxLength={2000}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && !busy) setAction(null);
                    }}
                  />
                </label>
                <div className="exhibition-actions">
                  <button
                    className="primary-button"
                    disabled={busy || !reason.trim()}
                  >
                    {t("exhibitions.confirm")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setAction(null)}
                  >
                    {t("exhibitions.cancel")}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
