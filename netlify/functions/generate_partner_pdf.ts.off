import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type GeneratePdfPayload = {
  dossierId: string;
  partnerId: string;
  isTaxRate?: 0.15 | 0.25;
  assumedGrossYield?: number;
};

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return { statusCode: 500, body: JSON.stringify({ error: `Missing env var: ${key}` }) };
    }
  }

  let payload: GeneratePdfPayload;
  try {
    payload = JSON.parse(event.body || '{}') as GeneratePdfPayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { dossierId, partnerId } = payload;
  const isTaxRate = payload.isTaxRate ?? 0.25;
  const assumedGrossYield = payload.assumedGrossYield ?? 0.06;

  if (!dossierId || !partnerId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing dossierId or partnerId' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  const { data: dossier, error: dossierError } = await supabase
    .from('partner_dossiers')
    .select('*')
    .eq('id', dossierId)
    .single();

  if (dossierError || !dossier) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Dossier not found' }) };
  }

  if (dossier.partner_id && dossier.partner_id !== partnerId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Partner mismatch' }) };
  }

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (partnerError || !partner) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Partner not found' }) };
  }

  const investedAmount = Number(dossier.invested_amount ?? 0);
  const grossIncome = investedAmount * assumedGrossYield;
  const isTax = grossIncome * isTaxRate;
  const netCash = grossIncome - isTax;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0.15, 0.15, 0.2);

  let cursorY = 780;
  const lineGap = 18;

  const drawHeading = (text: string) => {
    page.drawText(text, { x: 50, y: cursorY, size: 16, font: boldFont, color: textColor });
    cursorY -= lineGap + 6;
  };

  const drawTextLine = (text: string) => {
    page.drawText(text, { x: 50, y: cursorY, size: 11, font, color: textColor });
    cursorY -= lineGap;
  };

  drawHeading('Synthèse – Immobilier indirect (SCPI)');

  drawHeading('Dossier');
  drawTextLine(`Cabinet : ${partner.cabinet_name}`);
  drawTextLine(`Client : ${dossier.client_label || 'Client confidentiel'}`);
  drawTextLine(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
  drawTextLine(`Montant investi : ${investedAmount.toLocaleString('fr-FR')} €`);

  cursorY -= 10;
  drawHeading('Hypothèses');
  drawTextLine(`Rendement brut annuel : ${(assumedGrossYield * 100).toFixed(2)} %`);
  drawTextLine(`IS estimé : ${(isTaxRate * 100).toFixed(2)} %`);

  cursorY -= 10;
  drawHeading('Résultats');
  drawTextLine(`Cash net annuel estimé : ${netCash.toLocaleString('fr-FR')} €`);

  cursorY -= 10;
  drawHeading('Indicateurs de sélection (placeholders)');
  drawTextLine('• Cohérence structurelle : à compléter');
  drawTextLine('• Diversification : à compléter');
  drawTextLine('• Secteurs / zones : à compléter');

  cursorY -= 10;
  drawHeading('Disclaimer CIF');
  drawTextLine('Document informatif, sans valeur de recommandation ni de performance future.');

  const pdfBytes = await pdfDoc.save();

  const storagePath = `${partnerId}/${dossierId}/${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('partner-reports')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (uploadError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Upload failed' }) };
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('partner-reports')
    .createSignedUrl(storagePath, 60 * 60);

  if (signedError || !signedData?.signedUrl) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Signed URL failed' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ signedUrl: signedData.signedUrl, storagePath })
  };
};
