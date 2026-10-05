import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type PublicProfile = {
  user_id: string;
  full_name: string;
  follower_count: number;
  following_count: number;
  like_count: number;
  is_following: boolean;
  is_self: boolean;
};

export type ProfileAccount = {
  user_id: string;
  full_name: string;
  is_following: boolean;
};

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

