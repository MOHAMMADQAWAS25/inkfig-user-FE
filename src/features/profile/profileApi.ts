import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type PublicProfile = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  like_count: number;
  is_following: boolean;
  is_self: boolean;
};

export type ProfileAccount = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  is_following: boolean;
};

export type ProfileSearchResult = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
};

export type ProfileSearchPage = {
  items: ProfileSearchResult[];
  next_cursor: number | null;
};

export async function searchProfilesPage(
  query: string,
  cursor?: number,
  limit = 20,
): Promise<ProfileSearchPage> {
  const parameters = new URLSearchParams({ query, limit: String(limit) });
  if (cursor !== undefined) parameters.set("cursor", String(cursor));
  return (
    await requestJson<ProfileSearchPage>(
      userApiBaseUrl,
      "GET",
      `/profiles/search?${parameters.toString()}`,
    )
  ).data;
}

export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
  return (await searchProfilesPage(query, undefined, 8)).items;
}

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  return (await requestJson<PublicProfile>(userApiBaseUrl, "GET", `/profiles/${userId}`)).data;
}

export async function getProfileConnections(
  userId: string,
  kind: "followers" | "following",
): Promise<ProfileAccount[]> {
  return (
    await requestJson<{ items: ProfileAccount[] }>(
      userApiBaseUrl,
      "GET",
      `/profiles/${userId}/${kind}`,
    )
  ).data.items;
}

export async function setProfileFollow(userId: string, following: boolean): Promise<void> {
  await requestJson<null>(
    userApiBaseUrl,
    following ? "PUT" : "DELETE",
    `/profiles/${userId}/follow`,
  );
}
