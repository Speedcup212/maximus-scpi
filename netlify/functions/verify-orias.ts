import type { Handler } from '@netlify/functions';
import { verifyOriasNumber } from './utils/orias-verifier';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let payload: { oriasNumber?: string };
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Corps JSON invalide.' })
    };
  }

  const oriasNumber = payload.oriasNumber?.trim();
  if (!oriasNumber || !/^\d{8}$/.test(oriasNumber)) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Numéro ORIAS invalide (8 chiffres requis).' })
    };
  }

  try {
    const result = await verifyOriasNumber(oriasNumber);

    if (!result.isValid) {
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          valid: false,
          reason: 'Numéro ORIAS introuvable ou radié.',
          isCif: false,
          association: null,
        })
      };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        valid: true,
        isCif: result.isCif,
        association: result.association,
      })
    };
  } catch (error) {
    console.error('[verify-orias] Erreur:', error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Erreur lors de la vérification ORIAS.' })
    };
  }
};
