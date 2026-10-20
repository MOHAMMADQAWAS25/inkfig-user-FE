import { expect, it } from "vitest";
import { exhibitionEnd, exhibitionPeriod } from "../src/features/exhibitions/exhibitionPeriod";
const event = { exhibition_id:"event", creator_user_id:"admin", name:"Art", description:"Art", event_at:"2026-10-20T12:00:00Z", event_ends_at:"2026-10-23T12:00:00Z", participation_opens_at:"2026-10-01T12:00:00Z", participation_closes_at:"2026-10-19T12:00:00Z", participation_open:false, banner_url:null, created_at:"2026-10-01T12:00:00Z" };
it("classifies start-inclusive and end-exclusive current exhibitions", () => {
 expect(exhibitionPeriod(event,Date.parse(event.event_at)-1)).toBe("upcoming");
 expect(exhibitionPeriod(event,Date.parse(event.event_at))).toBe("current");
 expect(exhibitionPeriod(event,Date.parse(event.event_ends_at)-1)).toBe("current");
 expect(exhibitionPeriod(event,Date.parse(event.event_ends_at))).toBe("past");
});
it("uses the same safe legacy 24-hour duration as the backend", () => {
 expect(exhibitionEnd({...event,event_ends_at:undefined})).toBe("2026-10-21T12:00:00.000Z");
});
