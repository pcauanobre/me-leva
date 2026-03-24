export function slugify(name: string, id?: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (id) {
    return `${base}-${id.slice(0, 8)}`;
  }
  return base;
}
