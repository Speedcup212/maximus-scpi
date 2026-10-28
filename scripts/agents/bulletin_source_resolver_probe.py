#!/usr/bin/env python3
"""Read-only network evidence from the same runner as archive extraction."""
import argparse,concurrent.futures,datetime,hashlib,json,pathlib,re,ssl,subprocess,urllib.parse,urllib.request
import bulletin_source_transport as transport
import bulletin_source_resolver as resolver

UA='Mozilla/5.0 (compatible; MaximusSCPI-DocumentReplay/1.0; +https://maximusscpi.com/)'

def public_url(url):
    parts=urllib.parse.urlsplit(url)
    if parts.scheme!='https' or not parts.hostname or parts.username or parts.password or re.search(r'(^|[.-])(extranet|private|intranet|login|auth|localhost)([.-]|$)',parts.hostname):
        raise ValueError('not_a_public_https_source')
    return url

class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        public_url(newurl)
        return super().redirect_request(req,fp,code,msg,headers,newurl)

def probe(item, output):
    result=dict(item)
    body=output/(hashlib.sha256(item['url'].encode()).hexdigest()+'.source')
    try:
        public_url(item['url'])
        req=urllib.request.Request(item['url'],headers={'User-Agent':UA})
        opener=urllib.request.build_opener(PublicRedirect(),urllib.request.HTTPSHandler(context=transport.ssl_context()))
        with opener.open(req,timeout=25) as response:
            data=response.read()
            body.write_bytes(data)
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
        try:
            fetched=transport.curl_fetch(item['url'],body,public_url)
            result.update(**fetched,independent_client_recovered=True)
        except Exception as error:result['independent_client_error']=str(error)
    if body.exists() and ('urllib_status' in result or result.get('independent_client_recovered')):
        data=body.read_bytes()
        result.update(body_file=body.name,body_sha256=hashlib.sha256(data).hexdigest(),body_bytes=len(data))
        if not data.startswith(b'%PDF'):
            page=resolver.parse_html(data,result.get('final_url',item['url']))
            result['publisher_page']={k:v for k,v in page.items() if k!='text'}
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--registry',required=True);ap.add_argument('--out',required=True);args=ap.parse_args()
    out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True)
    sources=json.loads(pathlib.Path(args.registry).read_text())['sources']
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(lambda item:probe(item,out),sources))
    report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'ssl_paths':ssl.get_default_verify_paths()._asdict(),'sources':rows}
    # No secrets or credentials are read; only public certificate-chain diagnostics.
    cert=subprocess.run(['openssl','s_client','-connect','www.sofidy.com:443','-servername','www.sofidy.com','-showcerts','-verify_return_error'],input='',capture_output=True,text=True,timeout=30)
    (out/'sofidy-public-certificate-chain.txt').write_text(cert.stdout+'\n'+cert.stderr)
    (out/'source-access.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    for row in rows:print(json.dumps({k:v for k,v in row.items() if k not in ('prefix','publisher_page')},ensure_ascii=False),flush=True)

if __name__=='__main__':main()
