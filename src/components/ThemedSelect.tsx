import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };
export function ThemedSelect({ label, value, options, onChange, name, required, disabled = false }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void;
  name?: string; required?: boolean; disabled?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  const [placement, setPlacement] = useState({ up: false, height: 230 });
  function show(index: number) {
    const rect = root.current?.getBoundingClientRect();
    if (rect) {
      let top = window.visualViewport?.offsetTop ?? 0;
      let bottom = top + (window.visualViewport?.height ?? window.innerHeight);
      // Keep menus inside a scrolling signup card, not behind its clipped edge.
      for (let node = root.current?.parentElement; node; node = node.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(node).overflowY)) {
          const bounds = node.getBoundingClientRect();
          top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom);
        }
      }
      const below = bottom - rect.bottom - 10, above = rect.top - top - 10;
      const up = below < Math.min(230, options.length * 42 + 12) && above > below;
      setPlacement({ up, height: Math.max(44, Math.min(230, up ? above : below)) });
    }
    setActive(index); setOpen(true);
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, open, id]);
  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false); trigger.current?.focus({ preventScroll: true });
  }
  function keydown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
        : Math.max(0, Math.min(options.length - 1, (open ? active : selected) + (event.key === "ArrowDown" ? 1 : -1)));
      if (open) setActive(next); else show(next);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); if (open) choose(active); else show(selected);
    } else if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    else if (event.key === "Tab") setOpen(false);
    else if (event.key.length === 1) {
      const index = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
      if (index >= 0) { event.preventDefault(); if (open) setActive(index); else show(index); }
    }
  }
  return <div ref={root} className="themed-select" data-open={open} data-side={placement.up ? "top" : "bottom"} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <span id={`${id}-label`} className="themed-select-label">{label}</span>
    <select className="sr-only themed-select-native" aria-hidden="true" tabIndex={-1} name={name} required={required} disabled={disabled} value={value}
      onChange={event => onChange(event.target.value)} onInvalid={event => { event.preventDefault(); trigger.current?.focus(); }}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <button ref={trigger} className="themed-select-trigger" type="button" role="combobox" aria-labelledby={`${id}-label`}
      aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox" aria-required={required}
      aria-activedescendant={open ? `${id}-option-${active}` : undefined} disabled={disabled} onKeyDown={keydown}
      onClick={() => { if (open) setOpen(false); else show(selected); }}>
      <span>{options[selected]?.label}</span><ChevronDown size={18} aria-hidden="true"/>
    </button>
    <div className="themed-select-options" style={{ maxHeight: placement.height }} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} aria-hidden={!open} inert={!open}>
      {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value === value}
        className={index === active ? "is-active" : ""} onPointerMove={event => { if (event.pointerType !== "touch") setActive(index); }}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Check size={16} aria-hidden="true"/>}
      </div>)}
    </div>
  </div>;
}
