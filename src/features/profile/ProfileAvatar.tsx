import { useState } from "react";
export function ProfileAvatar({ name, url, language, className = "profile-avatar-image" }: {
  name: string; url?: string | null; language: string; className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return url && failed !== url ? <img className={className} src={url} alt="" loading="lazy" onError={() => setFailed(url)}/>
    : <span className={`${className} profile-avatar-initial`} aria-hidden="true">{Array.from(name.trim())[0]?.toLocaleUpperCase(language) || "I"}</span>;
}
