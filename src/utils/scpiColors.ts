import { SCPIExtended } from '../data/scpiDataExtended';
import { getDominantGeography } from './dominantGeography';

/**
 * Système de couleurs pour les cartes SCPI
 * Basé sur la géographie dominante comme axe principal
 */

export interface GeographyColorScheme {
  // Couleur principale de la géographie
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryBg: string;
  primaryBorder: string;
  primaryText: string;
  
  // Couleurs pour les éléments secondaires
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  
  // Badge géographie
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Obtient le schéma de couleurs basé sur la géographie dominante
 */
export function getGeographyColorScheme(scpi: SCPIExtended): GeographyColorScheme {
  const dominantGeo = getDominantGeography(scpi);
  const geographyName = dominantGeo.geographyName;

  // France → Bleu profond (#1F3A5F)
  if (geographyName === 'France') {
    return {
      primary: '#1F3A5F', // Bleu profond
      primaryDark: '#152A47',
      primaryLight: '#2A4A7A',
      primaryBg: 'bg-[#1F3A5F]/10',
      primaryBorder: 'border-[#1F3A5F]/40',
      primaryText: 'text-[#4A7CB8]',
      
      accent: '#2563EB',
      accentBg: 'bg-blue-500/10',
      accentBorder: 'border-blue-500/30',
      accentText: 'text-blue-400',
      
      badgeBg: 'bg-[#1F3A5F]/20',
      badgeText: 'text-[#4A7CB8]',
      badgeBorder: 'border-[#1F3A5F]/50'
    };
  }

  // Europe (inclut Diversifiée géographiquement) → Violet/Indigo (#4B3F72)
  if (geographyName === 'Europe' || geographyName === 'Diversifiée géographiquement') {
    return {
      primary: '#4B3F72', // Violet/Indigo
      primaryDark: '#3A2F5A',
      primaryLight: '#5C4F8A',
      primaryBg: 'bg-[#4B3F72]/10',
      primaryBorder: 'border-[#4B3F72]/40',
      primaryText: 'text-[#7B6FA3]',
      
      accent: '#7C3AED',
      accentBg: 'bg-purple-500/10',
      accentBorder: 'border-purple-500/30',
      accentText: 'text-purple-400',
      
      badgeBg: 'bg-[#4B3F72]/20',
      badgeText: 'text-[#7B6FA3]',
      badgeBorder: 'border-[#4B3F72]/50'
    };
  }

  // International → Teal/Cyan
  if (geographyName === 'International') {
    return {
      primary: '#0F766E', // Teal profond
      primaryDark: '#0A5A54',
      primaryLight: '#1A9B8F',
      primaryBg: 'bg-teal-600/10',
      primaryBorder: 'border-teal-600/40',
      primaryText: 'text-teal-400',
      
      accent: '#14B8A6',
      accentBg: 'bg-teal-500/10',
      accentBorder: 'border-teal-500/30',
      accentText: 'text-teal-400',
      
      badgeBg: 'bg-teal-600/20',
      badgeText: 'text-teal-400',
      badgeBorder: 'border-teal-600/50'
    };
  }

  // Par défaut (Non spécifiée) → Slate
  return {
    primary: '#475569',
    primaryDark: '#334155',
    primaryLight: '#64748B',
    primaryBg: 'bg-slate-500/10',
    primaryBorder: 'border-slate-500/40',
    primaryText: 'text-slate-400',
    
    accent: '#64748B',
    accentBg: 'bg-slate-500/10',
    accentBorder: 'border-slate-500/30',
    accentText: 'text-slate-400',
    
    badgeBg: 'bg-slate-500/20',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-500/50'
  };
}

/**
 * Couleurs réservées à la performance (vert uniquement)
 */
export const PERFORMANCE_COLORS = {
  primary: '#10B981', // emerald-500
  light: '#34D399', // emerald-400
  dark: '#059669', // emerald-600
  bg: 'bg-emerald-500',
  bgLight: 'bg-emerald-500/20',
  bgGradient: 'from-emerald-600 to-emerald-500',
  text: 'text-emerald-400',
  textBold: 'text-emerald-300',
  border: 'border-emerald-500/30',
  shadow: 'shadow-emerald-500/20'
};

/**
 * Couleurs pour les secteurs (discret, outline uniquement)
 */
export function getSectorOutlineColor(sectorName: string): {
  border: string;
  text: string;
  bg: string;
} {
  const name = sectorName.toLowerCase();
  
  // Tous les secteurs utilisent des couleurs discrètes (outline)
  if (name.includes('santé') || name.includes('ehpad')) {
    return {
      border: 'border-pink-500/30',
      text: 'text-pink-400/70',
      bg: 'bg-transparent'
    };
  }
  if (name.includes('résidentiel') || name.includes('habitation')) {
    return {
      border: 'border-slate-400/30',
      text: 'text-slate-400/70',
      bg: 'bg-transparent'
    };
  }
  if (name.includes('commerce') || name.includes('retail')) {
    return {
      border: 'border-slate-400/30',
      text: 'text-slate-400/70',
      bg: 'bg-transparent'
    };
  }
  if (name.includes('logistique') || name.includes('entrepôt')) {
    return {
      border: 'border-slate-400/30',
      text: 'text-slate-400/70',
      bg: 'bg-transparent'
    };
  }
  if (name.includes('bureau')) {
    return {
      border: 'border-slate-400/30',
      text: 'text-slate-400/70',
      bg: 'bg-transparent'
    };
  }
  if (name.includes('hôtel') || name.includes('tourisme')) {
    return {
      border: 'border-slate-400/30',
      text: 'text-slate-400/70',
      bg: 'bg-transparent'
    };
  }
  
  // Par défaut
  return {
    border: 'border-slate-500/30',
    text: 'text-slate-400/70',
    bg: 'bg-transparent'
  };
}
