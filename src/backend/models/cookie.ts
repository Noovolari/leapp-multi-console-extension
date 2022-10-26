export type CookiesMap = Map<string, Cookie>;

export interface Cookie {
  name: string;
  value: string;
  expiration: string;
  path: string;
}
