'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PROJECT_TYPES, PRICING_PLANS, calcTotalPrice, type ProjectType, type PricingPlan } from '@/lib/pricing';
import { useAuth } from '@/components/providers/AuthProvider';

const STEPS = [
  { id: 1, title: 'Project Type', description: 'Select your project type' },
  { id: 2, title: 'Details', description: 'Provide project details' },
  { id: 3, title: 'Pricing', description: 'Choose your plan' },
  { id: 4, title: 'Contact', description: 'Your information' },
  { id: 5, title: 'Review', description: 'Confirm and submit' },
];

export function OrderWizard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    requirements: '',
    referenceUrls: '',
    deadline: '',
  });
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('professional');
  const [contactInfo, setContactInfo] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    company: '',
    phone: '',
    preferredContact: 'email' as 'email' | 'phone',
  });

  const typeData = PROJECT_TYPES.find((t) => t.id === selectedType);
  const planData = PRICING_PLANS.find((p) => p.id === selectedPlan);
  const totalPrice = typeData && planData ? calcTotalPrice(selectedType!, selectedPlan) : 0;
  const progress = (step / STEPS.length) * 100;

  function next() {
    if (step === 1 && !selectedType) return toast.error('Please select a project type');
    if (step === 2 && (!projectDetails.title || !projectDetails.description)) return toast.error('Please fill in the required fields');
    if (step === 4 && (!contactInfo.name || !contactInfo.email)) return toast.error('Please fill in your contact information');
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectType: selectedType,
          plan: selectedPlan,
          totalPrice,
          projectDetails,
          contactInfo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');
      toast.success(`Order ${data.order.orderId} submitted! We'll contact you within 24 hours.`);
      router.push('/contact?orderSuccess=1');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-custom py-12 lg:py-16">
      {/* Progress */}
      <div className="fixed top-16 lg:top-20 left-0 right-0 h-1 bg-dark-100 dark:bg-dark-800 z-40">
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} className="h-full bg-gradient-to-r from-primary-500 to-primary-700" />
      </div>

      {/* Step indicator */}
      <div className="hidden md:flex items-center justify-between mb-10 pt-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
              step > s.id ? 'bg-primary-500 text-white'
                : step === s.id ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                : 'bg-dark-200 dark:bg-dark-700 text-dark-400'
            }`}>
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={`ml-2 text-sm font-medium hidden lg:block ${step >= s.id ? 'text-dark-900 dark:text-white' : 'text-dark-400'}`}>{s.title}</span>
            {i < STEPS.length - 1 && <div className="w-12 h-0.5 bg-dark-200 dark:bg-dark-700 mx-3 hidden lg:block" />}
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-2">
          Start Your <span className="gradient-text">Project</span>
        </h1>
        <p className="text-dark-600 dark:text-dark-300">
          Step {step} of {STEPS.length}: {STEPS[step - 1].title}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">What type of project?</h2>
                <p className="text-dark-600 dark:text-dark-400 mb-8">Choose the category that best fits your vision</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                        selectedType === t.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                          : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-white/80 dark:bg-dark-900/80 backdrop-blur flex items-center justify-center text-2xl">{t.icon}</div>
                      <div className="w-10 h-10 rounded-xl mb-4" style={{ backgroundColor: t.color }} />
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{t.name}</h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">{t.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500">Timeline: {t.timeline}</span>
                        <span className="font-bold text-dark-900 dark:text-white">${t.basePrice.toLocaleString()}+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && typeData && (
              <div className="card">
                <div className="flex items-center gap-4 mb-8 p-4 rounded-xl" style={{ backgroundColor: `${typeData.color}15` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: typeData.color }}>{typeData.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white">{typeData.name}</h2>
                    <p className="text-dark-600 dark:text-dark-400">{typeData.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="label">Project Title *</label>
                    <input className="input" placeholder="My Amazing 3D Portfolio" value={projectDetails.title} onChange={(e) => setProjectDetails({ ...projectDetails, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Project Description *</label>
                    <textarea className="input resize-none" rows={4} placeholder="Describe your project goals, target audience, and vision..." value={projectDetails.description} onChange={(e) => setProjectDetails({ ...projectDetails, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Specific Requirements</label>
                    <textarea className="input resize-none" rows={3} placeholder="Any specific features, integrations, or technical requirements..." value={projectDetails.requirements} onChange={(e) => setProjectDetails({ ...projectDetails, requirements: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Reference URLs (Optional)</label>
                    <input className="input" type="url" placeholder="https://example.com - sites you like for inspiration" value={projectDetails.referenceUrls} onChange={(e) => setProjectDetails({ ...projectDetails, referenceUrls: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Preferred Deadline</label>
                    <input className="input" type="date" value={projectDetails.deadline} min={new Date().toISOString().split('T')[0]} onChange={(e) => setProjectDetails({ ...projectDetails, deadline: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && typeData && (
              <div className="card">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Choose Your Plan</h2>
                <p className="text-dark-600 dark:text-dark-400 mb-8">Select the level of service that fits your needs</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRICING_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                          : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                          Most Popular
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">{plan.name}</h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-dark-900 dark:text-white">${(typeData.basePrice * plan.multiplier).toLocaleString()}</span>
                        <span className="text-dark-500 ml-1">one-time</span>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-dark-600 dark:text-dark-400">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />{f}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full py-3 rounded-xl font-semibold ${selectedPlan === plan.id ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300'}`}>
                        {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-dark-600 dark:text-dark-400">
                      <span>Base Price ({typeData.name})</span>
                      <span>${typeData.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-dark-600 dark:text-dark-400">
                      <span>{planData!.name} Plan ({planData!.multiplier}x)</span>
                      <span>+${((planData!.multiplier - 1) * typeData.basePrice).toLocaleString()}</span>
                    </div>
                    <hr className="border-dark-200 dark:border-dark-700" />
                    <div className="flex justify-between text-lg font-bold text-dark-900 dark:text-white">
                      <span>Total</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Your Information</h2>
                <p className="text-dark-600 dark:text-dark-400 mb-8">We&apos;ll use this to send your proposal and project updates</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input className="input" type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={contactInfo.company} onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Preferred Contact Method</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setContactInfo({ ...contactInfo, preferredContact: 'email' })} className={`btn ${contactInfo.preferredContact === 'email' ? 'btn-primary' : 'btn-secondary'}`}>Email</button>
                      <button type="button" onClick={() => setContactInfo({ ...contactInfo, preferredContact: 'phone' })} className={`btn ${contactInfo.preferredContact === 'phone' ? 'btn-primary' : 'btn-secondary'}`}>Phone</button>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mt-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-sm text-dark-700 dark:text-dark-300">
                    💡 Have an account? <a href="/login?redirect=/order" className="text-primary-600 dark:text-primary-400 hover:underline">Sign in</a> to autofill and track your orders.
                  </div>
                )}
              </div>
            )}

            {step === 5 && typeData && planData && (
              <div className="card">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Review your order</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-2">Project</h3>
                    <p className="text-dark-900 dark:text-white font-medium">{typeData.name}</p>
                    <p className="text-dark-600 dark:text-dark-400 text-sm">{projectDetails.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-2">Plan & Price</h3>
                    <p className="text-dark-900 dark:text-white font-medium">{planData.name} — ${totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-2">Contact</h3>
                    <p className="text-dark-900 dark:text-white">{contactInfo.name} ({contactInfo.email})</p>
                    {contactInfo.company && <p className="text-sm text-dark-600 dark:text-dark-400">{contactInfo.company}</p>}
                  </div>
                  <div className="border-t border-dark-200 dark:border-dark-700 pt-6">
                    <p className="text-lg font-bold text-dark-900 dark:text-white">Total: ${totalPrice.toLocaleString()}</p>
                    <p className="text-sm text-dark-500 mt-1">No payment now — we&apos;ll send a proposal within 24 hours.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <button onClick={back} disabled={step === 1} className="btn-secondary">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {step < STEPS.length ? (
            <button onClick={next} className="btn-primary">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Order <Check className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}