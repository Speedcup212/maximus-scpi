// Current issuer certification never certifies an unavailable previous period.
export const qualifiedHistoryException = (row) => {
  if (row.certification_status !== 'current_certified_history_unverified' ||
      row.current_source_certified !== true || row.comparison_certified !== false ||
      !row.previous_period || !row.current_period || row.previous_period === row.current_period ||
      !Array.isArray(row.certification_reasons) || row.certification_reasons.length !== 1 ||
      !Array.isArray(row.improvements) || row.improvements.length > 0 ||
      !Array.isArray(row.deteriorations) || row.deteriorations.length > 0) return false;
  const code = String(row.certification_reasons[0]?.code || '');
  if (code === 'structural_or_extreme_change') return row.structural_event_detected === true;
  if (code === 'semiannual_reporting_cadence') return row.structural_event_detected !== true;
  if (code === 'history_not_certified') {
    // Only the explicit current-only state is allowed. The global release gate
    // still validates the current URL, every high alert and absence of trends.
    return row.structural_event_detected === false && Array.isArray(row.watch_points) &&
      row.watch_points.some(signal => signal.metric === 'data_quality_history' &&
        signal.quality_issue === true && typeof signal.message === 'string' && signal.message.trim().length > 0);
  }
  return false;
};
