import { SCPIExtended } from '../data/scpiDataExtended';
import { AllocationAmounts } from '../types/subscription';

export const validateAllocation = (allocation: Record<number, number>): boolean => {
  const sum = Object.values(allocation).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 100) < 0.01; // Tolérance 0.01%
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-.+]/g, '');
  // 10 chiffres, ne doit pas être tout à 0 ou un seul chiffre répété
  if (!/^\d{10}$/.test(cleaned)) return false;
  if (/^([0-9])\1{9}$/.test(cleaned)) return false;
  return true;
};

export const validatePostalCode = (postalCode: string): boolean => {
  const cleaned = postalCode.replace(/\s/g, '');
  if (!/^\d{5}$/.test(cleaned)) return false;
  if (cleaned === '00000') return false;
  return true;
};

export const validateNif = (nif: string): boolean => {
  const cleaned = nif.replace(/\s/g, '');
  // Longueur minimale et ne doit pas être uniquement des zéros
  if (cleaned.length < 8) return false;
  if (/^0+$/.test(cleaned)) return false;
  return true;
};

export const validateAmount = (
  amount: number, 
  minInvestment: number
): { valid: boolean; error?: string } => {
  if (amount < minInvestment) {
    return {
      valid: false,
      error: `Le montant minimum est de ${minInvestment.toLocaleString('fr-FR')}€`
    };
  }
  if (amount > 10000000) {
    return {
      valid: false,
      error: 'Le montant maximum est de 10 000 000€'
    };
  }
  return { valid: true };
};

export const calculateAllocationAmounts = (
  totalAmount: number,
  allocation: Record<number, number>,
  scpis: SCPIExtended[]
): Record<number, AllocationAmounts> => {
  const result: Record<number, AllocationAmounts> = {};
  
  scpis.forEach(scpi => {
    const percentage = allocation[scpi.id] || 0;
    const amount = Math.round((percentage / 100) * totalAmount);
    const shares = Math.floor(amount / scpi.price);
    result[scpi.id] = { amount, shares };
  });
  
  return result;
};

export const calculateAverageYield = (scpis: SCPIExtended[]): number => {
  if (scpis.length === 0) return 0;
  const sum = scpis.reduce((acc, scpi) => acc + scpi.yield, 0);
  return sum / scpis.length;
};

export const calculateMinInvestment = (scpis: SCPIExtended[]): number => {
  if (scpis.length === 0) return 0;
  return scpis.reduce((sum, scpi) => sum + scpi.minInvestment, 0);
};


