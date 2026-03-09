import { randomUUID } from "node:crypto";

export interface BffSessionData {
  accessToken: string;
  createdAt: number;
}

const sessions = new Map<string, BffSessionData>();

export function createBffSession(data: BffSessionData): string {
  const sid = randomUUID();
  sessions.set(sid, data);
  return sid;
}

export function getBffSession(sid: string | undefined | null): BffSessionData | undefined {
  if (!sid) return undefined;
  return sessions.get(sid);
}

export function deleteBffSession(sid: string | undefined | null): void {
  if (!sid) return;
  sessions.delete(sid);
}

