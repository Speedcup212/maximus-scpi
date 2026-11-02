#!/usr/bin/env python3
"""Repair only a missing *intermediate* for TLS, after validating to OS-trusted root.

No SSL verification is disabled. The intermediate URL is read from the leaf AIA
and fetched from Sectigo, then the complete chain is verified before being used.
"""
import argparse
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT_BUNDLE=Path("/etc/ssl/certs/ca-certificates.crt")
HOST="www.sofidy.com"
AIA_URI="http://crt.sectigo.com/TBSRSAOrganizationValidationSecureServerCA4.crt"
HTTPS_ISSUER_URI="https://crt.sectigo.com/TBSRSAOrganizationValidationSecureServerCA4.crt"

def command(argv, input_bytes=None, check=True):
    p=subprocess.run(argv,input=input_bytes,capture_output=True,timeout=35,check=False)
    if check and p.returncode!=0:
        raise ValueError("TRUST_CHAIN_COMMAND_FAILED:"+str(argv[:3])+":"+p.stderr.decode(errors="replace")[-350:])
    return p.stdout

def verified_bundle(output):
    if not ROOT_BUNDLE.is_file():raise ValueError("SYSTEM_CA_BUNDLE_MISSING")
    raw=command(["openssl","s_client","-connect",HOST+":443","-servername",HOST,"-showcerts"],b"",False)
    blocks=re.findall(rb"-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----",raw)
    if len(blocks)<2:raise ValueError("ORIGIN_CERT_CHAIN_NOT_AVAILABLE")
    with tempfile.TemporaryDirectory() as name:
        directory=Path(name)
        leaf=directory/"leaf.pem"
        extras=directory/"issuer_chain.pem"
        downloaded=directory/"intermediate.crt"
        intermediate=directory/"intermediate.pem"
        leaf.write_bytes(blocks[0]+b"\n")
        extras.write_bytes(b"\n".join(blocks[1:])+b"\n")
        leaf_text=command(["openssl","x509","-in",str(leaf),"-noout","-text"]).decode(errors="replace")
        if AIA_URI not in leaf_text:raise ValueError("UNEXPECTED_LEAF_CERT_AIA")
        if "TBS RSA Organization Validation Secure Server CA 4" not in leaf_text:
            raise ValueError("UNEXPECTED_LEAF_ISSUER")
        if not HTTPS_ISSUER_URI.startswith("https://crt.sectigo.com/"):
            raise ValueError("AIA_CA_DOWNLOAD_NOT_ALLOWED")
        # Only if the HTTPS CA endpoint cannot handshake, use the exact
        # HTTP AIA URI from the leaf. Its bytes remain UNTRUSTED until
        # openssl verify proves the chain to the OS root below.
        try:
            req=urllib.request.Request(HTTPS_ISSUER_URI,headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req,timeout=20) as response:
                data=response.read(100000)
        except Exception:
            req=urllib.request.Request(AIA_URI,headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req,timeout=20) as response:
                data=response.read(100000)
        downloaded.write_bytes(data)
        try:
            normalized=command(["openssl","x509","-inform","DER","-in",str(downloaded),"-outform","PEM"])
        except ValueError:
            normalized=command(["openssl","x509","-inform","PEM","-in",str(downloaded),"-outform","PEM"])
        intermediate.write_bytes(normalized)
        sub=command(["openssl","x509","-in",str(intermediate),"-noout","-subject"]).decode()
        if "TBS RSA Organization Validation Secure Server CA 4" not in sub:
            raise ValueError("DOWNLOADED_INTERMEDIATE_IDENTITY_MISMATCH")
        untrusted=directory/"untrusted.pem"
        untrusted.write_bytes(normalized+b"\n"+extras.read_bytes())
        verified=command(["openssl","verify","-CAfile",str(ROOT_BUNDLE),"-untrusted",str(untrusted),str(leaf)])
        if b": OK" not in verified:raise ValueError("ISSUER_NOT_CHAINED_TO_SYSTEM_ROOT")
        result=Path(output)
        result.parent.mkdir(parents=True,exist_ok=True)
        # This bundle is ephemeral and used only after root verification above.
        result.write_bytes(ROOT_BUNDLE.read_bytes()+b"\n"+untrusted.read_bytes())
        print("SOFIDY_TLS_CHAIN_VERIFIED_WITH_SYSTEM_ROOT: issuer intermediary restored, verification enabled")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",required=True)
    args=p.parse_args()
    verified_bundle(args.output)
