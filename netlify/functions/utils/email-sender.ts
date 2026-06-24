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
              <p style="margin:8px 0 0;font-size:14px;color:#a7f3d0;">Comparateur intelligent pour professionnels du patrimoine</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 20px;font-size:22px;color:#111827;font-weight:700;">
                Bonjour ${firstName},
              </h1>

              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Bienvenue sur <strong>MaximusSCPI</strong>, le comparateur intelligent con&ccedil;u par et pour les professionnels du patrimoine.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Votre num&eacute;ro ORIAS <strong style="color:#059669;">${oriasNumber}</strong> a &eacute;t&eacute; v&eacute;rifi&eacute;
                et valid&eacute; avec succ&egrave;s. Votre acc&egrave;s complet est d&eacute;sormais actif.
              </p>

              <h2 style="margin:0 0 12px;font-size:17px;color:#111827;font-weight:600;">
                Ce qui vous attend dans votre Espace Pro&nbsp;:
              </h2>
              <ul style="margin:0 0 28px;padding-left:20px;font-size:15px;color:#4b5563;line-height:2.2;">
                <li><strong>Simulateurs avanc&eacute;s</strong>&nbsp;: Pr&ecirc;ts &agrave; l'emploi pour concevoir vos allocations SCPI sur-mesure.</li>
                <li><strong>Kits de relance</strong>&nbsp;: Des documents et visuels exclusifs pr&ecirc;ts &agrave; &ecirc;tre partag&eacute;s avec vos clients.</li>
                <li><strong>Ressources priv&eacute;es</strong>&nbsp;: Vos guides et vid&eacute;os d'accompagnement.</li>
              </ul>

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

              <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
                Vos retours sont essentiels pour faire &eacute;voluer l'outil&nbsp;: si vous avez la moindre suggestion ou question, r&eacute;pondez directement &agrave; cet e-mail.
              </p>

              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
                &Agrave; tr&egrave;s vite sur votre tableau de bord,
              </p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-weight:600;">
                L'&eacute;quipe MaximusSCPI
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                MaximusSCPI &mdash; Cabinet de conseil en investissement financier
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                Immatricul&eacute; &agrave; l'ORIAS sous le num&eacute;ro 13001580 &bull; Membre de la CNCGP
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
 * Envoie l'e-mail de bienvenue via l'API Brevo (Sendinblue).
 * Nécessite la variable d'environnement BREVO_API_KEY.
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[email-sender] BREVO_API_KEY manquante');
    return false;
  }

  const { subject, htmlContent } = buildWelcomeEmailContent(params);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Eric de MaximusSCPI',
          email: 'eric@maximusscpi.com',
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
      console.error('[email-sender] Erreur Brevo:', response.status, errorBody);
      return false;
    }

    console.log('[email-sender] E-mail de bienvenue envoyé à', params.email);
    return true;
  } catch (error) {
    console.error('[email-sender] Erreur:', error instanceof Error ? error.message : error);
    return false;
  }
}
