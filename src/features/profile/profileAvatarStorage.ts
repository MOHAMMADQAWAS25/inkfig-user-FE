const AVATAR_PREFIX = "inkfig.profile-avatar.";
export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

export function getStoredProfileAvatar(userId: string): string | null {
  try {
    return localStorage.getItem(`${AVATAR_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

export function storeProfileAvatar(userId: string, value: string): void {
  localStorage.setItem(`${AVATAR_PREFIX}${userId}`, value);
}

export function readProfileAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image"));
    reader.onerror = () => reject(reader.error ?? new Error("Image could not be read"));
    reader.readAsDataURL(file);
  });
}

export function isValidProfileAvatar(file: File): boolean {
  return PROFILE_AVATAR_ACCEPT.split(",").includes(file.type) && file.size > 0 && file.size <= PROFILE_AVATAR_MAX_BYTES;
}
