interface WelcomeEmailParams {
  firstName: string;
  oriasNumber: string;
  email: string;
}

interface ClientActivationEmailParams {
  firstName: string;
  email: string;
  claimUrl: string;
  code: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

async function sendBrevoEmail(params: {
  email: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('[email-sender] BREVO_API_KEY manquante');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Maximus SCPI',
        email: 'eric.bellaiche@maximusscpi.com',
      },
      to: [{ email: params.email }],
      subject: params.subject,
      htmlContent: params.htmlContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[email-sender] Brevo a répondu avec une erreur :', response.status, errorBody);
    throw new Error(`[email-sender] Échec Brevo HTTP ${response.status} : ${errorBody}`);
  }

  console.log('[email-sender] E-mail envoyé à', params.email);
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
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b,#059669);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">MaximusSCPI Pro</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 20px;font-size:22px;color:#111827;font-weight:700;">Bonjour ${escapeHtml(firstName)},</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Votre inscription &agrave; l'Espace Pro MaximusSCPI a &eacute;t&eacute; valid&eacute;e (ORIAS&nbsp;: ${escapeHtml(oriasNumber)}).
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
                Vous pouvez d&egrave;s &agrave; pr&eacute;sent vous connecter &agrave; votre espace de travail.
              </p>
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
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">Cordialement,</p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">L'&eacute;quipe MaximusSCPI</p>
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

export function buildClientActivationEmailContent({
  firstName,
  claimUrl,
  code,
}: ClientActivationEmailParams): {
  subject: string;
  htmlContent: string;
} {
  const subject = 'Activez votre espace client MaximusSCPI';
  const safeName = escapeHtml(firstName || 'Madame, Monsieur');
  const safeUrl = escapeHtml(claimUrl);
  const safeCode = escapeHtml(code);

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
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b,#059669);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">MaximusSCPI</p>
              <p style="margin:8px 0 0;font-size:13px;color:#d1fae5;">Espace client privé</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 20px;font-size:22px;color:#111827;font-weight:700;">Bonjour ${safeName},</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Votre accès à l'espace client MaximusSCPI a été validé.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
                Cliquez sur le bouton ci-dessous puis saisissez le code provisoire pour choisir votre mot de passe.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="background-color:#10b981;border-radius:8px;padding:14px 36px;">
                    <a href="${safeUrl}"
                       style="font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;display:inline-block;letter-spacing:0.3px;">
                      Activer mon espace client
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin:0 0 24px;padding:16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;">
                <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Code provisoire</div>
                <div style="font-size:26px;letter-spacing:6px;font-weight:700;color:#065f46;">${safeCode}</div>
              </div>
              <p style="margin:0 0 24px;font-size:13px;color:#6b7280;line-height:1.6;">
                Ce lien est valable 48 heures. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
              </p>
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">Cordialement,</p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">L'équipe MaximusSCPI</p>
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

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const { subject, htmlContent } = buildWelcomeEmailContent(params);
  await sendBrevoEmail({ email: params.email, subject, htmlContent });
}

export async function sendClientActivationEmail(params: ClientActivationEmailParams): Promise<void> {
  const { subject, htmlContent } = buildClientActivationEmailContent(params);
  await sendBrevoEmail({ email: params.email, subject, htmlContent });
}


interface AuthActionEmailParams {
  email: string;
  actionUrl: string;
  action: 'magiclink' | 'recovery';
}

export async function sendAuthActionEmail(params: AuthActionEmailParams): Promise<void> {
  const isRecovery = params.action === 'recovery';
  const subject = isRecovery
    ? 'Réinitialisez votre mot de passe MaximusSCPI'
    : 'Votre lien de connexion MaximusSCPI';
  const title = isRecovery ? 'Réinitialiser mon mot de passe' : 'Se connecter à MaximusSCPI';
  const intro = isRecovery
    ? 'Vous avez demandé à définir un nouveau mot de passe pour votre espace privé MaximusSCPI.'
    : 'Voici votre lien sécurisé pour vous connecter à votre espace privé MaximusSCPI.';
  const safeUrl = escapeHtml(params.actionUrl);

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
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b,#059669);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">MaximusSCPI</p>
              <p style="margin:8px 0 0;font-size:13px;color:#d1fae5;">Espace privé</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 18px;font-size:22px;color:#111827;font-weight:700;">${title}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">${intro}</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="background-color:#10b981;border-radius:8px;padding:14px 36px;">
                    <a href="${safeUrl}"
                       style="font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;display:inline-block;letter-spacing:0.3px;">
                      ${title}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-size:13px;color:#6b7280;line-height:1.6;">
                Pour votre sécurité, ce lien est à usage unique. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
              </p>
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">Cordialement,</p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">L'équipe MaximusSCPI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await sendBrevoEmail({
    email: params.email,
    subject,
    htmlContent,
  });
}
