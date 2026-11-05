// Contract for the existing Netlify deployment — independent of PR declarations.
const SHA40=/^[a-f0-9]{40}$/;
const SITE='e4f16f87-663d-4965-8de8-00f6840f1aa7';
function fail(reason){return {status:'BLOCKED',reason,production_sha_verified:false,publication_authorized:false,postdeploy_100_proven:false};}
export function evaluatePublishedDeploy({site,deploy,expectedSha}) {
 if(!SHA40.test(expectedSha||''))return fail('EXPECTED_GIT_SHA_INVALID');
 if(!site||site.id!==SITE||!deploy||deploy.site_id!==SITE)return fail('NETLIFY_SITE_ID_MISMATCH');
 const published=site.published_deploy?.id||site.published_deploy_id;
 if(!published||published!==deploy.id)return fail('NOT_THE_PUBLISHED_DEPLOY');
 if(deploy.state!=='ready'||deploy.context!=='production'||deploy.branch!=='main'||
    !deploy.published_at)return fail('NOT_A_READY_PUBLISHED_MAIN_DEPLOY');
 if(deploy.commit_ref!==expectedSha)return fail('DEPLOYED_GIT_SHA_MISMATCH');
 if(deploy.url!=='https://maximusscpi.com'&&deploy.ssl_url!=='https://maximusscpi.com')
   return fail('PRODUCTION_HOSTNAME_MISMATCH');
 return {status:'PRODUCTION_SHA_MATCH',deploy_id:deploy.id,commit_sha:expectedSha,
   published_at:deploy.published_at,production_sha_verified:true,
   publication_authorized:false,postdeploy_100_proven:false};
}
