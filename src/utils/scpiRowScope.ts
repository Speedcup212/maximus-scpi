/**
 * Prevent financial and provenance values for a previously selected SCPI from
 * leaking into another fund's UI while asynchronous requests are in flight.
 * This is a display-only filter; it does not certify or mutate any values.
 */
export const onlyCurrentScpiRow = <T extends { scpi_slug?: string | null }>(
  row: T | null | undefined,
  scpiSlug: string,
): T | null => row?.scpi_slug === scpiSlug ? row : null;
