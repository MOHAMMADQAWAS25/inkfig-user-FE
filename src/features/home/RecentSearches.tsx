import { History, X } from "lucide-react";
import type { TranslationKey } from "../../i18n/resources";
import type { SearchEntry } from "./useSearchHistory";

export function RecentSearches({items,loading,error,activeIndex,onSelect,onRemove,onClear,t}:{items:SearchEntry[];loading:boolean;error:boolean;activeIndex:number;onSelect:(entry:SearchEntry)=>void;onRemove:(id:string)=>void;onClear:()=>void;t:(key:TranslationKey)=>string}){
 return <section className="recent-searches" id="recent-searches" aria-label={t("searchHistory.title")} onPointerDown={event=>event.preventDefault()}>
  <header><strong>{t("searchHistory.title")}</strong><button type="button" disabled={loading||items.length===0} onClick={onClear}>{t("searchHistory.clear")}</button></header>
  {loading?<p role="status">{t("searchHistory.loading")}</p>:error?<p role="alert">{t("searchHistory.failed")}</p>:items.length===0?<p>{t("searchHistory.empty")}</p>:<div role="listbox" aria-label={t("searchHistory.title")}>{items.map((item,index)=><div className={`recent-search-row${activeIndex===index?" active":""}`} key={item.search_history_id}><button id={`recent-search-${index}`} type="button" role="option" aria-selected={activeIndex===index} onClick={()=>onSelect(item)}><History size={17} aria-hidden="true"/><span>{item.query}</span></button><button className="recent-search-remove" type="button" aria-label={`${t("searchHistory.remove")}: ${item.query}`} title={t("searchHistory.remove")} onClick={()=>onRemove(item.search_history_id)}><X size={15} aria-hidden="true"/></button></div>)}</div>}
 </section>;
}
