const ZONE = 'Europe/Paris';
const ALLOWED_EVENTS = new Set(['schedule','workflow_dispatch','push']);

export function parisDay(value) {
 const d = new Date(value);
 if (!Number.isFinite(d.getTime())) throw new Error('Invalid GitHub run timestamp');
 const p = new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
 const v = Object.fromEntries(p.map(x=>[x.type,x.value]));
 return v.year+'-'+v.month+'-'+v.day;
}
export function budgetCost(run) {
 if (!ALLOWED_EVENTS.has(run.event)) return 0;
 if (run.event!=='schedule') return 1;
 const weekday = new Intl.DateTimeFormat('en-US',{timeZone:ZONE,weekday:'short'}).format(new Date(run.created_at));
 return ['Mon','Tue','Wed','Thu'].includes(weekday) ? 3 : 0;
}
/**
 * Fail closed. All executions reserve budget by their deterministic Github
 * creation ordering, even if canceled or failed (pessimistic upper bound).
 * Github workflow-level concurrency serializes actual model invocations.
 */
export function dailyAllowance(runs,currentId,now,max=3) {
 if (!Number.isSafeInteger(Number(currentId)) || Number(currentId)<=0) throw Error('Missing current GitHub run id');
 if (!Number.isInteger(max) || max<0 || max>3) throw Error('Invalid configured daily quota');
 if (!Array.isArray(runs)) throw Error('Missing complete GitHub run history');
 const current = runs.find(x=>Number(x.id)===Number(currentId));
 if (!current) throw Error('Current run absent from GitHub quota history');
 const date = parisDay(now);
 if (parisDay(current.created_at)!==date) return {allowed:0,prior_reserved:0,reason:'day_rollover'};
 const ordered = runs.filter(x=>x.created_at && parisDay(x.created_at)===date)
  .sort((a,b)=>new Date(a.created_at)-new Date(b.created_at) || Number(a.id)-Number(b.id));
 let prior=0;
 for(const run of ordered) {
  if(Number(run.id)===Number(currentId)) break;
  prior+=budgetCost(run);
 }
 return {allowed:Math.max(0,Math.min(budgetCost(current),max-prior)),
   prior_reserved:prior, max_daily:max, reason:prior>=max?'quota_exhausted':'reserved'};
}
export async function fetchRunHistory({token,repository,runId,api='https://api.github.com',fetcher=fetch}) {
 if(!token || repository!=='Speedcup212/maximus-scpi' || !Number.isSafeInteger(Number(runId)))
   throw Error('Missing GitHub token/repository/run id for quota verification');
 const all=[];
 for(let page=1;page<=10;page++) {
  const url=api+'/repos/'+repository+'/actions/workflows/maximus-growth-agents.yml/runs?per_page=100&page='+page;
  const r=await fetcher(url,{headers:{
   Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'
  },signal:AbortSignal.timeout(12000)});
  if(!r.ok) throw Error('GitHub quota lookup HTTP '+r.status);
  const data=await r.json();
  if(!Array.isArray(data.workflow_runs))throw Error('Malformed Github runs payload');
  all.push(...data.workflow_runs);
  if(data.workflow_runs.length<100) {
    if(!all.some(x=>Number(x.id)===Number(runId)))throw Error('Current run missing in quota history');
    return all;
  }
 }
 throw Error('Excessive run history; quota lookup cannot prove safety');
}
export async function enforceQuota(env=process.env,now=new Date()) {
 const runId=env.GITHUB_RUN_ID,token=env.GITHUB_TOKEN,repository=env.GITHUB_REPOSITORY;
 const history=await fetchRunHistory({token,repository,runId});
 return dailyAllowance(history,runId,now,3);
}
