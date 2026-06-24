interface WelcomeEmailParams {
  firstName: string;
  oriasNumber: string;
  email: string;
}

export function buildWelcomeEmailContent({ firstName, oriasNumber }: WelcomeEmailParams): {
  subject: string;
  htmlContent: string;
} {
  const subject = "Bienvenue sur l'Espace Pro MaximusSCPI ! 🚀";

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b,#059669);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">MaximusSCPI Pro</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 20px;font-size:22px;color:#111827;font-weight:700;">
                Bonjour ${firstName},
              </h1>

              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Votre inscription &agrave; l'Espace Pro MaximusSCPI a &eacute;t&eacute; valid&eacute;e (ORIAS&nbsp;: ${oriasNumber}).
              </p>

              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
                Vous pouvez d&egrave;s &agrave; pr&eacute;sent vous connecter &agrave; votre espace de travail.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background-color:#10b981;border-radius:8px;padding:14px 36px;">
                    <a href="https://maximusscpi.com/pro/login"
                       style="font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;display:inline-block;letter-spacing:0.3px;">
                      Acc&eacute;der &agrave; mon Espace Pro
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
                Cordialement,
              </p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">
                L'&eacute;quipe MaximusSCPI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, htmlContent };
}

/**
 * Envoie l'e-mail de bienvenue via l'API Brevo (fetch HTTP brut).
 * Nécessite la variable d'environnement BREVO_API_KEY.
 * Throw en cas d'échec pour que l'erreur remonte dans les logs Netlify.
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('[email-sender] BREVO_API_KEY manquante');
  }

  const { subject, htmlContent } = buildWelcomeEmailContent(params);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Maximus SCPI',
        email: 'eric.bellaiche@maximusscpi.com',
      },
      to: [
        { email: params.email },
      ],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[email-sender] Brevo a répondu avec une erreur :', response.status, errorBody);
    throw new Error(`[email-sender] Échec Brevo HTTP ${response.status} : ${errorBody}`);
  }

  console.log('[email-sender] E-mail de bienvenue envoyé à', params.email);
}
