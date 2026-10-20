import { afterEach, expect, it, vi } from "vitest";
import { requestJson } from "../src/api/httpClient";
import { getManagedUsersPage } from "../src/features/admin/administrationApi";
import { getReports } from "../src/features/reports/reportsApi";
vi.mock("../src/api/httpClient",()=>({userApiBaseUrl:"https://example.test",requestJson:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
it("includes every report filter and ordering in subsequent batch requests",async()=>{
  vi.mocked(requestJson).mockResolvedValue({data:{items:[],next_cursor:null},status:200});
  await getReports("pending",25,{targetType:"work",reasonCode:"copyright",sort:"oldest"});
  const url=new URL(String(vi.mocked(requestJson).mock.calls[0][2]),"https://example.test");
  expect(Object.fromEntries(url.searchParams)).toEqual({limit:"25",cursor:"25",status:"pending",target_type:"work",reason_code:"copyright",sort:"oldest"});
});
it("requests a bounded user page with literal search, role and inactive filter",async()=>{
  vi.mocked(requestJson).mockResolvedValue({data:{items:[],next_cursor:null},status:200});
  const controller=new AbortController();await getManagedUsersPage(10,{limit:10,query:"  50%_ student  ",role:"user",isActive:false},controller.signal);
  const call=vi.mocked(requestJson).mock.calls[0];const url=new URL(String(call[2]),"https://example.test");
  expect(Object.fromEntries(url.searchParams)).toEqual({limit:"10",cursor:"10",query:"50%_ student",role:"user",is_active:"false"});
  expect(call[3]?.signal).toBe(controller.signal);
});
