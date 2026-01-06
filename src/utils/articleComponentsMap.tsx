import React from 'react';

// Import tous les composants d'articles
import { FondsEurosOuScpiArticle } from '../components/articles/FondsEurosOuScpiArticle';
import { ScpiDirectOuAssuranceVieArticle } from '../components/articles/ScpiDirectOuAssuranceVie';
import { default as Article100kFondsEuros } from '../components/articles/100000EurosFondsEurosCoutOpportuniteArticle';
import { default as ArticleInvestir200k } from '../components/articles/Investir200000EurosScpiPortefeuilleDiversifieArticle';
import { default as ArticleScpiVsLocatif } from '../components/articles/ScpiOuImmobilierLocatifComparatif20AnsArticle';
import { default as ArticleScpiCredit } from '../components/articles/AchatScpiCreditEffetLevierFiscaliteArticle';
import { default as ArticleDemembrement } from '../components/articles/DemembrementScpiNueProprieteUsufruitArticle';
import { default as ArticleScpiTmi11 } from '../components/articles/InvestirScpiTmi11PourcentFiscaliteOptimaleArticle';
import { default as ArticleScpiTmi30 } from '../components/articles/ScpiTmi30PourcentArbitrageAvDirectArticle';
import { default as ArticleScpiTmi41 } from '../components/articles/ForteImpositionTmi41ScpiAssuranceVieArticle';
import { default as ArticleScpiEuropeennes } from '../components/articles/ScpiEuropeennesAvantagesPs0RendementArticle';
import { default as ArticleScpiFiscales } from '../components/articles/ScpiFiscalesMalrauxDeficitFoncier2025Article';
import { default as ArticleScpiSante } from '../components/articles/ScpiSanteSeniorsEhpadCliniquesInvestissementArticle';
import { default as ArticleScpiBureaux } from '../components/articles/ScpiBureauxTertiaireTeletravail2025Article';
import { default as ArticleScpiCommerces } from '../components/articles/ScpiCommercesRetailECommerceOpportunitesArticle';
import { default as ArticleScpiLogistique } from '../components/articles/ScpiLogistiqueEntrepotsECommerce2025Article';
import { default as ArticleScpiResidentielles } from '../components/articles/ScpiResidentiellesLogementLocatifScpiHabitationArticle';
import { default as ArticlePerScpi } from '../components/articles/PerScpiRetraiteDeductionFiscaleArticle';
import { default as ArticleSciScpi } from '../components/articles/SciScpiSocieteCivileImmobilierePartsArticle';
import { default as ArticleIfiScpi } from '../components/articles/IfiScpiImpotFortuneImmobiliereStrategiesArticle';
import { default as ArticleSuccessionScpi } from '../components/articles/SuccessionScpiTransmissionDroitsHeritageArticle';
import { default as ArticleDiversificationScpi } from '../components/articles/DiversificationScpiCombienNombrePartsArticle';
import { default as ArticleRendementScpi2025 } from '../components/articles/RendementScpi2025TdvmTauxDistributionArticle';
import { default as ArticleRisquesScpi } from '../components/articles/RisquesScpiVacanceLocativeLiquiditeArticle';
import { default as ArticleFraisScpi } from '../components/articles/FraisScpiSouscriptionGestionPerformanceArticle';
import { default as ArticleReventeScpi } from '../components/articles/RevendrePartsScpiDelaisMarcheSecondaireArticle';
import { default as ArticleScpiVsEtf } from '../components/articles/ScpiOuEtfImmobilierReitComparatifArticle';
import { default as ArticleScpiVsOpci } from '../components/articles/ScpiOuOpciDifferencesAvantagesArticle';
import { default as ArticlePremierInvestissement } from '../components/articles/PremierInvestissementScpiDebutantGuideArticle';
import { default as ArticleScpiJeuneActif } from '../components/articles/InvestirScpiJeuneActif2535AnsArticle';
import { default as ComprendreSCPIPage } from '../components/ComprendreSCPIPage';
import { default as MentionsLegalesPage } from '../components/MentionsLegalesPage';
import { default as PolitiqueConfidentialitePage } from '../components/PolitiqueConfidentialitePage';
import { default as ConditionsUtilisationPage } from '../components/ConditionsUtilisationPage';
import { default as ReclamationPage } from '../components/ReclamationPage';
import { default as AboutUsPage } from '../components/AboutUsPage';

// Map component_name → composant React
export const ARTICLE_COMPONENTS: Record<string, React.FC> = {
  'FondsEurosOuScpiArticle': FondsEurosOuScpiArticle,
  'ScpiDirectOuAssuranceVie': ScpiDirectOuAssuranceVieArticle,
  '100000EurosFondsEurosCoutOpportuniteArticle': Article100kFondsEuros,
  'Investir200000EurosScpiPortefeuilleDiversifieArticle': ArticleInvestir200k,
  'ScpiOuImmobilierLocatifComparatif20AnsArticle': ArticleScpiVsLocatif,
  'AchatScpiCreditEffetLevierFiscaliteArticle': ArticleScpiCredit,
  'DemembrementScpiNueProprieteUsufruitArticle': ArticleDemembrement,
  'InvestirScpiTmi11PourcentFiscaliteOptimaleArticle': ArticleScpiTmi11,
  'ScpiTmi30PourcentArbitrageAvDirectArticle': ArticleScpiTmi30,
  'ForteImpositionTmi41ScpiAssuranceVieArticle': ArticleScpiTmi41,
  'ScpiEuropeennesAvantagesPs0RendementArticle': ArticleScpiEuropeennes,
  'ScpiFiscalesMalrauxDeficitFoncier2025Article': ArticleScpiFiscales,
  'ScpiSanteSeniorsEhpadCliniquesInvestissementArticle': ArticleScpiSante,
  'ScpiBureauxTertiaireTeletravail2025Article': ArticleScpiBureaux,
  'ScpiCommercesRetailECommerceOpportunitesArticle': ArticleScpiCommerces,
  'ScpiLogistiqueEntrepotsECommerce2025Article': ArticleScpiLogistique,
  'ScpiResidentiellesLogementLocatifScpiHabitationArticle': ArticleScpiResidentielles,
  'PerScpiRetraiteDeductionFiscaleArticle': ArticlePerScpi,
  'SciScpiSocieteCivileImmobilierePartsArticle': ArticleSciScpi,
  'IfiScpiImpotFortuneImmobiliereStrategiesArticle': ArticleIfiScpi,
  'SuccessionScpiTransmissionDroitsHeritageArticle': ArticleSuccessionScpi,
  'DiversificationScpiCombienNombrePartsArticle': ArticleDiversificationScpi,
  'RendementScpi2025TdvmTauxDistributionArticle': ArticleRendementScpi2025,
  'RisquesScpiVacanceLocativeLiquiditeArticle': ArticleRisquesScpi,
  'FraisScpiSouscriptionGestionPerformanceArticle': ArticleFraisScpi,
  'RevendrePartsScpiDelaisMarcheSecondaireArticle': ArticleReventeScpi,
  'ScpiOuEtfImmobilierReitComparatifArticle': ArticleScpiVsEtf,
  'ScpiOuOpciDifferencesAvantagesArticle': ArticleScpiVsOpci,
  'PremierInvestissementScpiDebutantGuideArticle': ArticlePremierInvestissement,
  'InvestirScpiJeuneActif2535AnsArticle': ArticleScpiJeuneActif,
  'ComprendreSCPIPage': ComprendreSCPIPage,
  'MentionsLegalesPage': MentionsLegalesPage,
  'PolitiqueConfidentialitePage': PolitiqueConfidentialitePage,
  'ConditionsUtilisationPage': ConditionsUtilisationPage,
  'ReclamationPage': ReclamationPage,
  'AboutUsPage': AboutUsPage,
};

// Fonction helper pour récupérer un composant par son nom
export function getArticleComponent(componentName: string): React.FC | null {
  return ARTICLE_COMPONENTS[componentName] || null;
}
