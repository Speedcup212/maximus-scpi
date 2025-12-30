import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LeadData {
  nom?: string;
  email: string;
  telephone?: string;
  montant?: string;
  commentaire?: string;
  creneau?: string;
  profil_risque?: string;
  profil_esg?: string;
  scpi?: string[];
  portfolio_selection?: string[];
  horizon?: string;
  objectifs?: string;
  tmi?: string;
  source?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const leadData: LeadData = await req.json();
    console.log('Received lead data:', JSON.stringify(leadData, null, 2));

    const emailBody = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #1e40af; }
            .value { color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nouveau Lead MaximusSCPI</h2>
            </div>
            <div class="content">
              ${leadData.nom ? `<div class="field"><span class="label">Nom:</span> <span class="value">${leadData.nom}</span></div>` : ''}
              <div class="field"><span class="label">Email:</span> <span class="value">${leadData.email}</span></div>
              ${leadData.telephone ? `<div class="field"><span class="label">Téléphone:</span> <span class="value">${leadData.telephone}</span></div>` : ''}
              ${leadData.montant ? `<div class="field"><span class="label">Montant:</span> <span class="value">${leadData.montant}</span></div>` : ''}
              ${leadData.creneau ? `<div class="field"><span class="label">Créneau:</span> <span class="value">${leadData.creneau}</span></div>` : ''}
              ${leadData.profil_risque ? `<div class="field"><span class="label">Profil Risque:</span> <span class="value">${leadData.profil_risque}</span></div>` : ''}
              ${leadData.profil_esg ? `<div class="field"><span class="label">Profil ESG:</span> <span class="value">${leadData.profil_esg}</span></div>` : ''}
              ${leadData.horizon ? `<div class="field"><span class="label">Horizon:</span> <span class="value">${leadData.horizon}</span></div>` : ''}
              ${leadData.objectifs ? `<div class="field"><span class="label">Objectifs:</span> <span class="value">${leadData.objectifs}</span></div>` : ''}
              ${leadData.tmi ? `<div class="field"><span class="label">TMI:</span> <span class="value">${leadData.tmi}</span></div>` : ''}
              ${leadData.scpi && leadData.scpi.length > 0 ? `<div class="field"><span class="label">SCPI:</span> <span class="value">${leadData.scpi.join(', ')}</span></div>` : ''}
              ${leadData.portfolio_selection && leadData.portfolio_selection.length > 0 ? `<div class="field"><span class="label">Portfolio sélectionné (${leadData.portfolio_selection.length} SCPI):</span> <span class="value">${leadData.portfolio_selection.join(', ')}</span></div>` : ''}
              ${leadData.commentaire ? `<div class="field"><span class="label">Commentaire:</span> <span class="value">${leadData.commentaire}</span></div>` : ''}
              <div class="field"><span class="label">Source:</span> <span class="value">${leadData.source || 'Web'}</span></div>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    console.log('Sending email to maximusscpi@gmail.com...');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'MaximusSCPI <onboarding@resend.dev>',
        to: ['maximusscpi@gmail.com'],
        subject: `Nouveau Lead - ${leadData.source || 'Web'} - ${leadData.email}`,
        html: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API Error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});