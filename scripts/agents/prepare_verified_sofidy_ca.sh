#!/usr/bin/env bash
# RECOVERY-198: repair Sofidy's missing TLS intermediate WITHOUT trusting HTTP bytes.
# GitHub runner's existing trusted OS CA remains the only trust anchor.
set -euo pipefail
test -n "$RUNNER_TEMP"
test -n "$GITHUB_ENV"
curl --fail --silent --show-error --proto '=http' --max-redirs 0 \
  --max-time 25 --max-filesize 25000 \
  --output "$RUNNER_TEMP/tbs-ca4.crt" \
  'http://crt.sectigo.com/TBSRSAOrganizationValidationSecureServerCA4.crt'
openssl x509 -inform DER -in "$RUNNER_TEMP/tbs-ca4.crt" \
  -out "$RUNNER_TEMP/tbs-ca4.pem"
openssl x509 -in "$RUNNER_TEMP/tbs-ca4.pem" -noout -subject \
  | grep -F 'TBS RSA Organization Validation Secure Server CA 4'
openssl x509 -in "$RUNNER_TEMP/tbs-ca4.pem" -noout -text | grep -F 'CA:TRUE'
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt \
  "$RUNNER_TEMP/tbs-ca4.pem"
cat /etc/ssl/certs/ca-certificates.crt "$RUNNER_TEMP/tbs-ca4.pem" \
  > "$RUNNER_TEMP/sofidy-ca-chain.pem"
echo "SCPI_PUBLISHER_CA_BUNDLE=$RUNNER_TEMP/sofidy-ca-chain.pem" >> "$GITHUB_ENV"
