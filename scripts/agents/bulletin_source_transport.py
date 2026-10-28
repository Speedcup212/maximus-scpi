"""Verified public-document transport; never disable TLS or accept a CAPTCHA."""
from __future__ import annotations
import email.parser, hashlib, pathlib, ssl, subprocess, tempfile, urllib.error, urllib.parse, urllib.request

INTERMEDIATE = pathlib.Path(__file__).parent / 'certificates/tbs-rsa-organization-validation-ca4.pem'
INTERMEDIATE_SHA256 = '0d461a3b3b8ffa6e41f5d46ee70ce9c6bd09eba768c50db9a5537d6df050508b'

def ssl_context():
    context = ssl.create_default_context()
    certificate = INTERMEDIATE.read_text()
    der = ssl.PEM_cert_to_DER_cert(certificate)
    if hashlib.sha256(der).hexdigest() != INTERMEDIATE_SHA256:
        raise ValueError('issuer_intermediate_certificate_fingerprint_mismatch')
    # The missing intermediate is NOT a new trust anchor. A complete path to
    # an existing system root, hostname checks and certificate dates remain required.
    context.verify_flags &= ~ssl.VERIFY_X509_PARTIAL_CHAIN
    context.load_verify_locations(cadata=certificate)
    return context

def request_url(url):
    parts = urllib.parse.urlsplit(url)
    # Preserve the semantics of an existing URL. In particular an S3 raw "+"
    # must not become "%2B" (a different key), and query "+" must stay unchanged.
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc,
        urllib.parse.quote(parts.path, safe='/%:@+'),
        urllib.parse.quote(parts.query, safe='=&%:/?@+'), ''))

def curl_fetch(url, target, validate):
    """An independent standard HTTPS client; inspect every redirect ourselves."""
    current = url
    with tempfile.TemporaryDirectory() as temporary:
        headers = pathlib.Path(temporary) / 'headers'
        for _ in range(11):
            validate(current)
            proc = subprocess.run(['curl', '--silent', '--show-error', '--proto', '=https',
                '--max-time', '45', '--dump-header', str(headers), '--output', str(target),
                '--write-out', '%{http_code}', '--url', current],
                capture_output=True, text=True, timeout=50)
            if proc.returncode:
                raise OSError('curl_https_failed: ' + proc.stderr[-500:])
            status = int(proc.stdout[-3:])
            blocks = headers.read_text(errors='replace').replace('\r\n', '\n').strip().split('\n\n')
            metadata = email.parser.Parser().parsestr(blocks[-1].split('\n', 1)[-1])
            if status in (301, 302, 303, 307, 308):
                location = metadata.get('Location')
                if not location: raise ValueError('redirect_without_location')
                current = urllib.parse.urljoin(current, location)
                validate(current)
                continue
            if not 200 <= status < 300:
                raise OSError('curl_http_status_' + str(status))
            return {'final_url': current, 'content_type': metadata.get('Content-Type'),
                    'transport': 'curl_verified_https'}
    raise ValueError('too_many_public_redirects')

def fetch_to_path(url, target, opener, validate, user_agent):
    validate(url)
    url = request_url(url)
    req = urllib.request.Request(url, headers={'User-Agent': user_agent,
                                               'Accept': 'application/pdf,text/html;q=0.8'})
    try:
        with opener.open(req, timeout=45) as response:
            validate(response.url)
            with pathlib.Path(target).open('wb') as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
            return {'final_url': response.url, 'content_type': response.headers.get('Content-Type'),
                    'transport': 'urllib_verified_https'}
    except urllib.error.HTTPError as error:
        if error.code not in (403, 406): raise
        # A normal second client can retrieve some public publisher files that
        # reject urllib. A challenge body is still rejected by the document parser.
        return curl_fetch(url, target, validate)
