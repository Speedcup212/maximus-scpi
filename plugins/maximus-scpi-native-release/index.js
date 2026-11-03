import {writeBuildManifest,onPostBuildSourceCheck,onSuccessRelease} from './release.mjs';
export const onPreBuild=()=>{
 writeBuildManifest(process.env);
};
export const onPostBuild=async()=>{
 const result=await onPostBuildSourceCheck(process.env);
 console.log('[SCPI native Netlify] Provenance browser gate:',result);
};
export const onSuccess=async()=>{
 const result=await onSuccessRelease(process.env);
 console.log('[SCPI native Netlify] Postdeploy release verified:',JSON.stringify(result));
};
