import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export async function verifyOriasNumber(oriasNumber: string): Promise<boolean> {
  const credential = process.env.ORIAS_API_KEY;
  if (!credential) throw new Error("ORIAS_API_KEY manquante");

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.orias.fr/">
       <soapenv:Header/>
       <soapenv:Body>
          <ser:rechercheIntermediaire>
             <credential>${credential}</credential>
             <identifiant>${oriasNumber}</identifiant>
          </ser:rechercheIntermediaire>
       </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post('https://ws.orias.fr/service', soapEnvelope, {
      headers: { 'Content-Type': 'text/xml;charset=UTF-8' }
    });
    
    const result = await parseStringPromise(response.data);
    // Navigation prudente dans le XML renvoyé par l'ORIAS
    const body = result?.['soap:Envelope']?.['soap:Body']?.[0];
    const responseObj = body?.['ns2:rechercheIntermediaireResponse']?.[0] || body?.['rechercheIntermediaireResponse']?.[0];
    const intermediaire = responseObj?.return?.[0];
    
    return intermediaire?.status?.[0] === 'INSCRIT';
  } catch (error) {
    console.error("Erreur API ORIAS:", error);
    return false;
  }
}
