import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ExhibitionBackButton({ to, label, showLabel = false }: { to: string; label: string; showLabel?: boolean }) {
  return <Link className={`exhibition-back-button${showLabel ? " exhibition-back-button-labeled" : ""}`} to={to} aria-label={label} title={label}>
    <ArrowLeft size={21} aria-hidden="true"/>{showLabel && label}
  </Link>;
}
