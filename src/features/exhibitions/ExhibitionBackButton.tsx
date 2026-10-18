import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ExhibitionBackButton({ to, label }: { to: string; label: string }) {
  return <Link className="exhibition-back-button" to={to} aria-label={label} title={label}>
    <ArrowLeft size={21} aria-hidden="true"/>
  </Link>;
}
