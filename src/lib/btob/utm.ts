export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export const parseUtmFromLocation = (location: Location): UtmParams => {
  const params = new URLSearchParams(location.search);

  const utm_source = params.get('utm_source') || undefined;
  const utm_medium = params.get('utm_medium') || undefined;
  const utm_campaign = params.get('utm_campaign') || undefined;

  return { utm_source, utm_medium, utm_campaign };
};
