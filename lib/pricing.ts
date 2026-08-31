// Shared types between server and client

export type ProjectType =
  | 'portfolio'
  | 'ecommerce'
  | 'landing'
  | 'configurator'
  | 'exhibition'
  | 'custom';

export type PricingPlan = 'starter' | 'professional' | 'enterprise';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProjectTypeDef {
  id: ProjectType;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
  timeline: string;
  color: string;
  icon: string;
}

export const PROJECT_TYPES: ProjectTypeDef[] = [
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Showcase your work with a stunning 3D portfolio',
    basePrice: 5000,
    features: ['3D Hero Section', 'Project Gallery', 'About Page', 'Contact Form', 'CMS Integration'],
    timeline: '4-6 weeks',
    color: '#0ea5e9',
    icon: '🎨',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Experience',
    description: 'Immersive 3D product showcase and shopping',
    basePrice: 15000,
    features: ['3D Product Viewer', 'AR Preview', 'Custom Configurator', 'Checkout Integration', 'Admin Dashboard'],
    timeline: '8-12 weeks',
    color: '#8b5cf6',
    icon: '🛍️',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting 3D landing page for campaigns',
    basePrice: 3000,
    features: ['3D Hero Animation', 'Interactive Sections', 'Lead Capture', 'Analytics Setup', 'A/B Testing Ready'],
    timeline: '2-3 weeks',
    color: '#ec4899',
    icon: '🚀',
  },
  {
    id: 'configurator',
    name: 'Product Configurator',
    description: 'Real-time 3D product customization',
    basePrice: 12000,
    features: ['Real-time 3D Preview', 'Material/Color Options', 'Pricing Calculator', 'Quote Generation', 'CAD Integration'],
    timeline: '6-8 weeks',
    color: '#22d3ee',
    icon: '⚙️',
  },
  {
    id: 'exhibition',
    name: 'Virtual Exhibition',
    description: 'Immersive virtual gallery or showroom',
    basePrice: 20000,
    features: ['Virtual Walkthrough', 'Multi-user Support', 'Avatar System', 'Live Events', 'Analytics Dashboard'],
    timeline: '10-14 weeks',
    color: '#f472b6',
    icon: '🏛️',
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Bespoke 3D experience tailored to your needs',
    basePrice: 25000,
    features: ['Custom 3D Development', 'Unique Interactions', 'Backend Integration', 'Ongoing Support', 'Source Code Delivery'],
    timeline: '12+ weeks',
    color: '#a855f7',
    icon: '✨',
  },
];

export interface PricingPlanDef {
  id: PricingPlan;
  name: string;
  description: string;
  multiplier: number;
  features: string[];
  popular: boolean;
}

export const PRICING_PLANS: PricingPlanDef[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small projects',
    multiplier: 1,
    features: ['Core Features', '2 Revisions', '30 Days Support', 'Source Code', 'Documentation'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing businesses',
    multiplier: 1.5,
    features: ['All Starter Features', '5 Revisions', '90 Days Support', 'Priority Support', 'Performance Optimization', 'SEO Setup'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large-scale projects',
    multiplier: 2.5,
    features: ['All Professional Features', 'Unlimited Revisions', '1 Year Support', 'Dedicated Manager', 'SLA Guarantee', 'Team Training', 'Custom Integrations'],
    popular: false,
  },
];

export function calcTotalPrice(typeId: ProjectType, planId: PricingPlan): number {
  const t = PROJECT_TYPES.find((x) => x.id === typeId);
  const p = PRICING_PLANS.find((x) => x.id === planId);
  if (!t || !p) return 0;
  return Math.round(t.basePrice * p.multiplier);
}