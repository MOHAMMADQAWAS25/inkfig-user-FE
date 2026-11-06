import { createContext, useContext } from "react";

/** Retained mobile galleries must not track the foreground page's scrolling. */
export const RouteActivity = createContext(true);
export const useRouteActivity = () => useContext(RouteActivity);
