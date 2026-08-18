import type { Folder } from "../types";

const KEY = "devchat_folders";

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Folder[];
  } catch {
    return [];
  }
}

export function saveFolders(folders: Folder[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(folders));
    return true;
  } catch {
    return false;
  }
}
