import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { WorkTypePicker } from "../src/features/works/WorkTypePicker";

afterEach(cleanup);
const types=[{type_id:"digital",code:"digital-art",name_en:"Digital Art",name_ar:"فن رقمي"},{type_id:"other",code:"other",name_en:"Other",name_ar:"أخرى"}];
function Picker({disabled=false}:{disabled?:boolean}){const [value,setValue]=useState("");return <WorkTypePicker types={types} value={value} onChange={setValue} disabled={disabled}/>;}
it.each(["en","ar"])("selects exactly one localized work type using native required radios (%s)",language=>{
  const {container}=render(<MemoryRouter initialEntries={[`/${language}/upload`]}><I18nProvider><Picker/></I18nProvider></MemoryRouter>);
  const first=screen.getByRole("radio",{name:language==="en"?"Digital Art":"فن رقمي"}) as HTMLInputElement;
  const second=screen.getByRole("radio",{name:language==="en"?"Other":"أخرى"}) as HTMLInputElement;
  expect(first.required).toBe(true);expect(first.name).toBe(second.name);
  fireEvent.click(first);expect(first.checked).toBe(true);
  fireEvent.click(second);expect(second.checked).toBe(true);expect(first.checked).toBe(false);
  expect(container.querySelectorAll('.work-type-option > svg[aria-hidden="true"]')).toHaveLength(2);
});
it("disables the type group while an upload is busy",()=>{
  const {container}=render(<MemoryRouter><I18nProvider><Picker disabled/></I18nProvider></MemoryRouter>);
  expect(container.querySelector("fieldset")?.disabled).toBe(true);
});
