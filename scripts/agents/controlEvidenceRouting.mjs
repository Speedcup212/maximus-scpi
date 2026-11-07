// RECOVERY-177: fail-closed CONTROL plan validation, no model calls or task writes.
const ROLES=new Set(['DATA','SEARCH','QA','ANALYST']);
const KEY=/^[A-Z][A-Z0-9_]{2,90}$/;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const boundedInt=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;

export function validateEvidenceRoutingPlan(plan){
  if(!plan||typeof plan!=='object'||Array.isArray(plan)||
     plan.version!=='recovery177-evidence-routing-v1'||
     plan.strategy!=='read_only_routing_proposal'||
     plan.deploy_allowed!==false||plan.financial_certified!==false||
     plan.new_tasks_created!==0||plan.new_issues_created!==0||
     plan.model_calls!==0)throw Error('CONTROL routing guard: forbidden side effects');
  if(!boundedInt(plan.existing_total,1000)||plan.existing_total===0||
     !boundedInt(plan.strict_pass,1000)||
     !boundedInt(plan.strict_fail,1000)||
     plan.existing_total!==plan.strict_pass+plan.strict_fail)
    throw Error('CONTROL routing guard: inconsistent existing-fund cohort');
  if(!Array.isArray(plan.families)||plan.families.length>24)
    throw Error('CONTROL routing guard: unexpected family count');
  const seen=new Set();let eventCount=0;
  for(const f of plan.families){
    if(!f||!KEY.test(f.route_family||'')||!ROLES.has(f.owner_role)||
       !boundedInt(f.priority,100)||
       !boundedInt(f.funds,plan.strict_fail)||f.funds===0||
       !boundedInt(f.evidence_items,100000)||
       !boundedInt(f.existing_role_task_overlaps,f.funds)||
       !Array.isArray(f.sample_funds)||f.sample_funds.length>8||
       f.sample_funds.length>f.funds||
       f.sample_funds.some(s=>typeof s!=='string'||!SLUG.test(s))||
       f.state!=='NOT_DISPATCHED_REQUIRES_SCOPED_PLAN')
      throw Error('CONTROL routing guard: invalid family scope');
    const id=f.route_family+':'+f.owner_role;
    if(seen.has(id)||new Set(f.sample_funds).size!==f.sample_funds.length)
      throw Error('CONTROL routing guard: duplicated family or fund');
    seen.add(id);eventCount+=f.evidence_items;
  }
  return {existing_total:plan.existing_total,strict_pass:plan.strict_pass,
    strict_fail:plan.strict_fail,families:plan.families.length,evidence_items:eventCount};
}
