// One authenticated DeepSeek model-catalog request. Never calls an inference
// endpoint, never prints a key, never records a financial or release PASS.
// Model names are grounded in https://api-docs.deepseek.com/api/list-models/
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ENDPOINT='https://api.deepseek.com/models';
const MODEL='deepseek-flash';

export async function verifyDeepSeekReady({apiKey,fetcher=fetch}={}){
 if(typeof apiKey!=='string'||apiKey.trim().length<20)
  throw Error('DEEPSEEK_API_KEY_MISSING_OR_INVALID_LENGTH');
 const response=await fetcher(ENDPOINT,{
  method:'GET',redirect:'error',
  headers:{Authorization:'Bearer '+apiKey,Accept:'application/json'},
  signal:AbortSignal.timeout(15000)
 });
 if(!response||!Number.isInteger(response.status)||!response.ok)
  throw Error('DEEPSEEK_MODELS_ENDPOINT_REJECTED_'+
   (Number.isInteger(response?.status)?response.status:'NETWORK'));
 let metadata;
 try{metadata=await response.json();}catch{throw Error('DEEPSEEK_MODELS_ENDPOINT_INVALID_JSON');}
 if(metadata?.object!=='list'||!Array.isArray(metadata.data)||
    !metadata.data.some(x=>x?.id===MODEL))
  throw Error('DEEPSEEK_FLASH_MODEL_NOT_LISTED');
 return Object.freeze({ready:true,provider:'deepseek',model:MODEL,
  verification:'authenticated_models_endpoint',inference_calls:0,
  financial_data_affected:false,release_authorized:false});
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 verifyDeepSeekReady({apiKey:process.env.DEEPSEEK_API_KEY}).then(r=>{
  process.stdout.write('DEEPSEEK_API_PREFLIGHT_OK model='+r.model+
   ' inference_calls=0 release_authorized=false\n');
 }).catch(e=>{
  // NEVER print raw HTTP bodies, response headers or user credentials.
  const safe=e.message?.startsWith('DEEPSEEK_')?e.message:'DEEPSEEK_API_PREFLIGHT_NETWORK_FAILURE';
  process.stderr.write('::error::'+safe+'\n');
  process.exitCode=1;
 });
}
