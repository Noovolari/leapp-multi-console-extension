import { LeappSessionInfo } from "./leapp-session-info";

export interface IsolatedSession {
  sessionId: number;
  tabsList: number[];
  leappSession: LeappSessionInfo;
  cookieStoreId?: string;
}
