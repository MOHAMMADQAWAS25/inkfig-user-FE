import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cacheWorkTypes, readCachedWorkTypes } from "../src/features/works/workTypesCache";
import { getWorkTypes } from "../src/features/works/worksApi";
import { requestJson } from "../src/api/httpClient";
vi.mock("../src/api/httpClient",()=>({mainApiBaseUrl:"/api",requestJson:vi.fn()}));
const types=[{type_id:"official-id",code:"digital-art",name_en:"Digital Art",name_ar:"فن رقمي"}];
beforeEach(()=>{sessionStorage.clear();vi.clearAllMocks();});
afterEach(()=>{sessionStorage.clear();vi.restoreAllMocks();});
it("reuses official public types across a refresh without a second network request",async()=>{
  vi.mocked(requestJson).mockResolvedValue({data:types,status:200});
  expect(await getWorkTypes()).toEqual(types);
  expect(readCachedWorkTypes()).toEqual(types);
  expect(await getWorkTypes()).toEqual(types);
  expect(requestJson).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("inkfig.work-types.v1")).not.toMatch(/userId|password|token/);
});
it("deduplicates in-flight reference-data requests and releases failures for retry",async()=>{
  let resolve!:(value:unknown)=>void;
  vi.mocked(requestJson).mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
  const first=getWorkTypes(),second=getWorkTypes();expect(first).toBe(second);
  resolve({data:types,status:200});await first;expect(requestJson).toHaveBeenCalledOnce();
  sessionStorage.clear();vi.mocked(requestJson).mockRejectedValueOnce(new Error("Offline"));
  await expect(getWorkTypes()).rejects.toThrow("Offline");
  vi.mocked(requestJson).mockResolvedValueOnce({data:types,status:200});
  expect(await getWorkTypes()).toEqual(types);
});
it("expires after five minutes and rejects future, malformed and duplicate cache records",()=>{
  const now=Date.now();vi.spyOn(Date,"now").mockReturnValue(now);cacheWorkTypes(types);
  vi.mocked(Date.now).mockReturnValue(now+300_000);expect(readCachedWorkTypes()).toBeNull();
  vi.mocked(Date.now).mockReturnValue(now-1);expect(readCachedWorkTypes()).toBeNull();
  vi.mocked(Date.now).mockReturnValue(now);
  sessionStorage.setItem("inkfig.work-types.v1","invalid");expect(readCachedWorkTypes()).toBeNull();
  sessionStorage.setItem("inkfig.work-types.v1",JSON.stringify({savedAt:now,items:[...types,...types]}));expect(readCachedWorkTypes()).toBeNull();
  sessionStorage.setItem("inkfig.work-types.v1",JSON.stringify({savedAt:now,items:[{...types[0],type_id:1}]}));expect(readCachedWorkTypes()).toBeNull();
});
it("supports empty catalogs and storage-disabled browsers without blocking network results",async()=>{
  cacheWorkTypes([]);expect(readCachedWorkTypes()).toEqual([]);
  vi.spyOn(Storage.prototype,"getItem").mockImplementation(()=>{throw new Error("Private mode");});
  vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new Error("Quota");});
  vi.mocked(requestJson).mockResolvedValueOnce({data:types,status:200});
  expect(await getWorkTypes()).toEqual(types);
});
