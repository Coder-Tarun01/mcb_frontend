export function toSlugSegment(input: string): string {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove punctuation
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // collapse hyphens
}

export function buildCompanySlug(name: string, id: string): string {
  const namePart = toSlugSegment(name);
  const idPart = String(id || '').toLowerCase();
  return [namePart, idPart].filter(Boolean).join('-');
}

/**
 * Build job slug: /jobs/<title>-<optional-location>-at-<company>-<id>
 * This matches the backend implementation
 */
export function buildJobSlug(params: {
  title: string;
  company: string;
  location?: string | null;
  id: string;
}): string {
  const titlePart = toSlugSegment(params.title);
  const companyPart = toSlugSegment(params.company);
  const locationRaw = params.location?.toString().trim();
  const locationPart = locationRaw ? toSlugSegment(locationRaw.split(',')[0] || '') : '';

  const parts = [titlePart];
  if (locationPart) parts.push(locationPart);
  parts.push('at', companyPart, params.id.toLowerCase());

  return parts.filter(Boolean).join('-');
}

/**
 * Extract id from slug by taking the last hyphen-separated token
 * Also handles UUIDs within the slug
 */
export function extractIdFromSlug(slugOrId: string): string {
  if (!slugOrId) return '';
  
  // If the string contains a UUID, return the UUID (handles ids with hyphens)
  const uuidMatch = slugOrId.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (uuidMatch) return uuidMatch[0];
  
  // Fallback: take the last hyphen-separated token
  const token = slugOrId.split('-').pop() as string;
  return token || slugOrId;
}


