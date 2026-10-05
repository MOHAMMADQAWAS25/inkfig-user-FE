import type { Work } from "./worksApi";

const tones:Record<string,string>={"digital art":"violet","hand art":"terracotta",video:"crimson",audio:"teal",animation:"amber",games:"blue","interactive art":"emerald",interactive:"emerald","virtual and augmented reality":"magenta","vr/ar":"magenta"};
const fallbacks=["violet","terracotta","crimson","teal","amber","blue","emerald","magenta"] as const;

export function workTypeTone(work:Work):string{const name=work.type_name_en.trim().toLowerCase();if(tones[name])return tones[name];const hash=[...work.type_id].reduce((value,character)=>(value*31+character.charCodeAt(0))>>>0,0);return fallbacks[hash%fallbacks.length];}
