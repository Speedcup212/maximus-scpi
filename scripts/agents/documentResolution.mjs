export function validateResolutionSummary(plan) {
  if (plan?.version !== 'recovery203-resolution-v1' || plan.orphaned !== 0 ||
      plan.financial_certified !== false || plan.deploy_allowed !== false || plan.model_calls !== 0)
    throw Error('Unsafe or incomplete documentary resolution');
  for (const key of ['inventoried','orphaned','unresolved','overdue','official_discovery_scheduled'])
    if (!Number.isSafeInteger(plan[key]) || plan[key] < 0) throw Error('Invalid resolution counts');
  if (plan.official_discovery_scheduled > 8 || plan.overdue > plan.unresolved)
    throw Error('Invalid resolution action budget');
  return plan;
}
