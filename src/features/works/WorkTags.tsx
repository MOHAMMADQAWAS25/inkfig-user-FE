import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "../../i18n/I18nProvider";
import type { Language } from "../../i18n/resources";
import { getWorkTags, type WorkTag } from "./worksApi";

const maxTags = 5;
const labelFor = (tag: WorkTag, language: Language) => language === "ar" ? tag.name_ar : tag.name_en;

export function WorkTagList({ tags, language, label }: {
  tags?: WorkTag[];
  language: Language;
  label: string;
}) {
  if (!tags?.length) return null;
  return <ul className="work-tag-list" aria-label={label}>
    {tags.map(tag => <li key={tag.key}>{labelFor(tag, language)}</li>)}
  </ul>;
}

export function WorkTagPicker({ value, onChange, disabled = false, automatic = false }: {
  value: string[];
  onChange: (keys: string[], tags: WorkTag[]) => void;
  disabled?: boolean;
  automatic?: boolean;
}) {
  const { language, t } = useI18n();
  const [search, setSearch] = useState("");
  const catalog = useQuery({
    queryKey: ["work-tag-catalog"],
    queryFn: ({ signal }) => getWorkTags(signal),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
  const normalized = search.trim().toLowerCase();
  const matching = (catalog.data ?? []).filter(tag =>
    tag.name_en.toLowerCase().includes(normalized) || tag.name_ar.includes(normalized)
  );

  return <fieldset className="work-tag-picker" disabled={disabled}>
    <legend>{t("works.tags")} ({value.length}/{maxTags})</legend>
    {automatic && <small>{t("works.autoTagsHint")}</small>}
    {catalog.isPending && <p role="status">{t("works.loadingTags")}</p>}
    {catalog.isError && <button type="button" className="text-button" onClick={() => void catalog.refetch()}>{t("works.retryTags")}</button>}
    {catalog.isSuccess && <>
      <label className="work-tag-search">
        <span>{t("works.searchTags")}</span>
        <input type="search" value={search} maxLength={80} onChange={event => setSearch(event.target.value)}/>
      </label>
      {normalized && !matching.length && <p role="status">{t("works.noTagsFound")}</p>}
      <div className="work-tag-options">
        {matching.map(tag => {
          const selected = value.includes(tag.key);
          return <button
            key={tag.key}
            type="button"
            aria-pressed={selected}
            disabled={!selected && value.length >= maxTags}
            onClick={() => {
              const keys = selected ? value.filter(key => key !== tag.key) : [...value, tag.key];
              onChange(keys, keys.flatMap(key => catalog.data.filter(item => item.key === key)));
            }}
          >{labelFor(tag, language)}</button>;
        })}
      </div>
    </>}
  </fieldset>;
}
