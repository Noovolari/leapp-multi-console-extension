import { LeappSessionType } from "./leapp-session-type";

export interface LeappSessionInfo {
  url: string;
  sessionName: string;
  sessionRegion: string;
  sessionRole: string;
  sessionType: LeappSessionType;
  createdAt: number;
}
