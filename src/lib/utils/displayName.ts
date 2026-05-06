export function displayName(name: string | null | undefined, sex: string | null | undefined): string {
  if (name?.trim()) return name.trim();
  return sex === "femea" ? "Amiguinha" : "Amiguinho";
}
