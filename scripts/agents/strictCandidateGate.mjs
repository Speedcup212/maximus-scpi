// Fail-closed admission gate for candidate20 agent cost.
 // FINANCE: only the existing strict view can authorize candidate work.
export function decideCandidate20Dispatch(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan) ||
      plan.deploy_allowed !== false || plan.financial_certified !== false ||
      plan.existing_total !== 69 ||
      !Number.isInteger(plan.strict_pass) || !Number.isInteger(plan.strict_fail) ||
      plan.strict_pass < 0 || plan.strict_fail < 0 ||
      plan.strict_pass + plan.strict_fail !== 69)
    throw Error('INVALID_STRICT_COHORT_GATE');
  return Object.freeze({
    dispatch: plan.strict_fail === 0,
    strictPass: plan.strict_pass,
    strictFail: plan.strict_fail
  });
}
