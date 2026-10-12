import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useSearchHistory, visibleSearchHistory, type SearchEntry } from "../src/features/home/useSearchHistory";
import { requestJson } from "../src/api/httpClient";
vi.mock("../src/api/httpClient",()=>({userApiBaseUrl:"api",requestJson:vi.fn()}));
const entry=(query:string):SearchEntry=>({query,normalized_query:query.toLowerCase(),search_history_id:query,last_searched_at:new Date().toISOString()});
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();});afterEach(cleanup);
it("shows only four recent entries or a complete normalized exact match",()=>{
 const items=["One","Two","Three","Four","Anime Art"].map(entry);
 expect(visibleSearchHistory(items,"")).toHaveLength(4);
 expect(visibleSearchHistory(items," ANIME ART ").map(item=>item.query)).toEqual(["Anime Art"]);
 expect(visibleSearchHistory(items,"Anime")).toEqual([]);
 expect(visibleSearchHistory(items,"Anime Artwork")).toEqual([]);
});
it("records guest submissions once, moves duplicates to top, bounds retention and removes entries",async()=>{
 const {result}=renderHook(()=>useSearchHistory(undefined));
 act(()=>{result.current.record("   ");});
 expect(localStorage.length).toBe(0);
 for(let i=0;i<22;i++){act(()=>result.current.record(`Query ${i}`));await waitFor(()=>expect(result.current.items[0]?.query).toBe(`Query ${i}`));}
 expect(result.current.items).toHaveLength(20);
 act(()=>result.current.record(" QUERY 5 "));
 await waitFor(()=>expect(result.current.items[0].query).toBe("QUERY 5"));
 expect(result.current.items.filter(item=>item.normalized_query==="query 5")).toHaveLength(1);
 const id=result.current.items[0].search_history_id;
 act(()=>result.current.remove(id));
 expect(result.current.items.some(item=>item.search_history_id===id)).toBe(false);
 act(()=>result.current.clear());
 await waitFor(()=>expect(JSON.parse(localStorage.getItem("inkfig:guest-search-history")!)).toEqual([]));
});
it("fetches account history through authenticated endpoints and clears visible data on account switch",async()=>{
 vi.mocked(requestJson).mockResolvedValue({data:[entry("Private")],status:200});
 const {result,rerender}=renderHook(({user})=>useSearchHistory(user),{initialProps:{user:"one"}});
 await act(()=>result.current.refresh());
 expect(result.current.items[0].query).toBe("Private");
 expect(requestJson).toHaveBeenCalledWith("api","GET","/search-history");
 rerender({user:"two"});expect(result.current.items).toEqual([]);
 expect(localStorage.length).toBe(0);
});
