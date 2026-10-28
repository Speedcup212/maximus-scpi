#!/usr/bin/env python3
"""Read-only network evidence from the same runner as archive extraction."""
import argparse,concurrent.futures,datetime,json,pathlib,re,ssl,subprocess,urllib.parse,urllib.request

UA='Mozilla/5.0 (compatible; MaximusSCPI-DocumentReplay/1.0; +https://maximusscpi.com/)'

def probe(item):
    result=dict(item)
    parts=urllib.parse.urlsplit(item['url'])
    if parts.scheme!='https' or not parts.hostname or parts.username or parts.password or re.search(r'(^|[.-])(extranet|private|intranet|login|auth|localhost)([.-]|$)',parts.hostname):
        return {**result,'error':'not_a_public_https_source'}
    try:
        req=urllib.request.Request(item['url'],headers={'User-Agent':UA})
        with urllib.request.urlopen(req,timeout=25) as response:
            data=response.read(2048)
            result.update(urllib_status=response.status,final_url=response.url,content_type=response.headers.get('Content-Type'),prefix=data[:80].decode('utf8','replace'))
    except Exception as error:
        result['urllib_error']=type(error).__name__+': '+str(error)
    # curl uses the system CA store independently of Python; TLS remains required.
    if 'urllib_error' in result:
        cmd=['curl','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--max-time','25','--range','0-2047','--output','/dev/null','--write-out','%{http_code} %{ssl_verify_result} %{url_effective}',item['url']]
        try:
            p=subprocess.run(cmd,capture_output=True,text=True,timeout=30)
            result.update(curl_returncode=p.returncode,curl_result=p.stdout,curl_error=p.stderr[-900:])
        except Exception as error:result['curl_error']=str(error)
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--registry',required=True);ap.add_argument('--out',required=True);args=ap.parse_args()
    out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True)
    sources=json.loads(pathlib.Path(args.registry).read_text())['sources']
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(probe,sources))
    report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'ssl_paths':ssl.get_default_verify_paths()._asdict(),'sources':rows}
    # No secrets or credentials are read; only public certificate-chain diagnostics.
    cert=subprocess.run(['openssl','s_client','-connect','www.sofidy.com:443','-servername','www.sofidy.com','-showcerts','-verify_return_error'],input='',capture_output=True,text=True,timeout=30)
    (out/'sofidy-public-certificate-chain.txt').write_text(cert.stdout+'\n'+cert.stderr)
    (out/'source-access.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    for row in rows:print(json.dumps({k:v for k,v in row.items() if k!='prefix'},ensure_ascii=False),flush=True)

if __name__=='__main__':main()
