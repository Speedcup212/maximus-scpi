# Missing issuer intermediate for Sofidy

The Sofidy server certificate observed on 2026-10-28 is issued by
TBS RSA Organization Validation Secure Server CA 4, but its server chain omits
that intermediate. Python and curl on Ubuntu 24.04 both fail verification.

The public intermediate comes from its issuing CA:
https://www.tbs-certificats.com/FAQ/fr/TBSRSAOrganizationValidationSecureServerCA4.html

DER SHA-256:
0d461a3b3b8ffa6e41f5d46ee70ce9c6bd09eba768c50db9a5537d6df050508b

It validates against the existing system roots with openssl verify.
The replay checks its fingerprint and adds it as chain-building material.
Partial-chain trust is disabled: no new root is trusted and TLS validation,
hostnames and certificate validity remain required.
