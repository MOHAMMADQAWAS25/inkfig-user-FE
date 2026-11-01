import { afterEach, expect, it, vi } from "vitest";
import { changeExhibitionRating } from "../src/features/exhibitions/exhibitionRatingsApi";

afterEach(()=>{vi.unstubAllGlobals();});
it.each([4,null])("sends a session-authenticated exhibition-scoped rating mutation: %s",async score=>{
  const response={average:4,vote_count:1,my_rating:score,can_rate:true};
  const request=vi.fn().mockResolvedValue(new Response(JSON.stringify(response),{status:200}));
  vi.stubGlobal("fetch",request);const controller=new AbortController();
  expect(await changeExhibitionRating("event","work",score,controller.signal)).toEqual(response);
  const [url,options]=request.mock.calls[0] as [string,RequestInit];
  expect(url).toContain("/exhibitions/event/works/work/rating");
  expect(options.credentials).toBe("include");expect(options.signal).toBe(controller.signal);
  expect(options.method).toBe(score===null?"DELETE":"PUT");
  if(score===null)expect(options.body).toBeUndefined();
  else expect(JSON.parse(String(options.body))).toEqual({score:4});
});
