import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ThemedSelect } from "../src/components/ThemedSelect";

afterEach(cleanup);
function Demo({ disabled = false }) {
  const [value, setValue] = useState("pending");
  return <form><ThemedSelect name="status" required label="Status" disabled={disabled} value={value} onChange={setValue}
    options={[{value:"pending",label:"Pending"},{value:"approved",label:"Approved"},{value:"rejected",label:"Rejected"}]}/><button type="button">Outside</button></form>;
}
it("opens, selects and closes with a retained native form value", () => {
  const { container } = render(<Demo/>);
  const trigger = screen.getByRole("combobox", { name: "Status" });
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("option", {name:"Approved"}));
  expect(trigger.textContent).toBe("Approved");
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(new FormData(container.querySelector("form")!).get("status")).toBe("approved");
  expect(document.activeElement).toBe(trigger);
});
it("supports arrows, Home/End, selection, Escape, Tab and outside dismissal", () => {
  render(<Demo/>);
  const trigger = screen.getByRole("combobox");
  fireEvent.keyDown(trigger, {key:"End"});
  expect(trigger.getAttribute("aria-activedescendant")).toContain("option-2");
  fireEvent.keyDown(trigger, {key:"Home"});
  fireEvent.keyDown(trigger, {key:"ArrowDown"});
  fireEvent.keyDown(trigger, {key:"Enter"});
  expect(trigger.textContent).toBe("Approved");
  fireEvent.click(trigger); fireEvent.keyDown(trigger, {key:"Escape"});
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.click(trigger); fireEvent.keyDown(trigger, {key:"Tab"});
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.click(trigger); fireEvent.pointerDown(screen.getByRole("button", {name:"Outside"}));
  expect(screen.queryByRole("listbox")).toBeNull();
});
it("disables the visual control and native field together", () => {
  const { container } = render(<Demo disabled/>);
  expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
  expect(container.querySelector("select")?.disabled).toBe(true);
});
