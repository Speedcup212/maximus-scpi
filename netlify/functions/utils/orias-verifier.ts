import axios from 'axios';
import { parseStringPromise, processors } from 'xml2js';

export interface OriasVerificationResult {
  isValid: boolean;
  association: string | null;
  isCif: boolean;
}

export async function verifyOriasNumber(oriasNumber: string): Promise<OriasVerificationResult> {
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

  const emptyResult: OriasVerificationResult = {
    isValid: false,
    association: null,
    isCif: false,
  };

  try {
    const response = await axios.post('https://ws.orias.fr/service', soapEnvelope, {
      headers: { 'Content-Type': 'text/xml;charset=UTF-8' }
    });

    const result = await parseStringPromise(response.data, {
      tagNameProcessors: [processors.stripPrefix]
    });

    // Navigation simplifiée : plus de préfixes soap:, ns2:, etc.
    const intermediaire = result?.Envelope?.Body?.[0]?.rechercheIntermediaireResponse?.[0]?.return?.[0];

    if (!intermediaire) {
      return emptyResult;
    }

    const status = intermediaire?.status?.[0];
    console.log("Statut ORIAS détecté :", status);

    if (status?.toUpperCase() !== 'INSCRIT') {
      return emptyResult;
    }

    // Chercher la catégorie CIF parmi les immatriculations
    const immatriculations =
      intermediaire?.immatriculations?.[0]?.immatriculation ||
      intermediaire?.immatriculations?.[0] ||
      intermediaire?.immatriculation ||
      [];

    // Normaliser en tableau
    const list = Array.isArray(immatriculations) ? immatriculations : [immatriculations];

    let association: string | null = null;
    let isCif = false;

    for (const immat of list) {
      const categorie = immat?.categorie?.[0]?.toUpperCase() || '';

      if (categorie === 'CIF') {
        isCif = true;

        // Tenter plusieurs noms de balises pour l'association de rattachement
        association =
          immat?.nomAssociation?.[0] ||
          immat?.libelleChambre?.[0] ||
          immat?.association?.[0] ||
          immat?.chambre?.[0] ||
          immat?.rattachement?.[0]?.nom?.[0] ||
          null;

        break; // On prend le premier bloc CIF trouvé
      }
    }

    return {
      isValid: true,
      association,
      isCif,
    };
  } catch (error) {
    console.error("Erreur API ORIAS:", error);
    return emptyResult;
  }
}
