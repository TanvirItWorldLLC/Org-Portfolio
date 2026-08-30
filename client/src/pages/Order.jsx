import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Loader2, CreditCard, Banknote, HelpCircle, AlertCircle } from 'lucide-react'
import { usePortfolio } from '../contexts/PortfolioContext'
import { useAuth } from '../contexts/AuthContext'
import { orderAPI } from '../services/api'
import { Scene3D } from '../components/three/Scene3D'
import toast from 'react-hot-toast'

const steps = [
  { id: 1, title: 'Project Type', description: 'Select your project type' },
  { id: 2, title: 'Details', description: 'Provide project details' },
  { id: 3, title: 'Pricing', description: 'Choose your plan' },
  { id: 4, title: 'Contact', description: 'Your information' },
  { id: 5, title: 'Review', description: 'Confirm and submit' },
]

const projectTypes = [
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
]

const pricingPlans = [
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
]

export default function Order() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects } = usePortfolio()
  const { user, isAuthenticated } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    requirements: '',
    referenceUrls: '',
    deadline: '',
  })
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    preferredContact: 'email',
  })
  const [submitting, setSubmitting] = useState(false)
  const [prefillProject, setPrefillProject] = useState(null)
  
  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setPrefillProject(project)
        // Pre-select a relevant project type
        if (project.category?.slug === 'web') setSelectedType('portfolio')
        else if (project.category?.slug === 'product') setSelectedType('configurator')
        else if (project.category?.slug === 'interactive') setSelectedType('exhibition')
      }
    }
    
    if (isAuthenticated && user) {
      setContactInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [projectId, projects, isAuthenticated, user])
  
  const selectedTypeData = projectTypes.find(t => t.id === selectedType)
  const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan)
  const totalPrice = selectedTypeData ? Math.round(selectedTypeData.basePrice * selectedPlanData.multiplier) : 0
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      // Validation
      if (currentStep === 1 && !selectedType) {
        toast.error('Please select a project type')
        return
      }
      if (currentStep === 2 && (!projectDetails.title || !projectDetails.description)) {
        toast.error('Please fill in the required fields')
        return
      }
      if (currentStep === 4 && (!contactInfo.name || !contactInfo.email)) {
        toast.error('Please fill in your contact information')
        return
      }
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const orderData = {
        projectType: selectedType,
        projectDetails,
        plan: selectedPlan,
        totalPrice,
        contactInfo,
        userId: user?.id,
      }
      
      await orderAPI.createOrder(orderData)
      toast.success('Order submitted successfully! We\'ll contact you within 24 hours.')
      navigate('/contact', { state: { orderSuccess: true } })
    } catch (error) {
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const progress = (currentStep / steps.length) * 100
  
  return (
    <>
      <Scene3D className="opacity-30" />
      
      <div className="relative z-10 min-h-screen bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-dark-100 dark:bg-dark-800 z-50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
          />
        </div>
        
        {/* Step Indicator */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-800 hidden md:block">
          <div className="container-custom">
            <div className="flex items-center justify-between px-4 py-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep > step.id
                          ? 'bg-primary-500 text-white'
                          : currentStep === step.id
                          ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                          : 'bg-dark-200 dark:bg-dark-700 text-dark-400'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </motion.div>
                    <span className={`text-sm font-medium hidden sm:block ${currentStep >= step.id ? 'text-dark-900 dark:text-white' : 'text-dark-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > step.id ? '60px' : currentStep === step.id ? '30px' : 0 }}
                      transition={{ duration: 0.3 }}
                      className="h-0.5 bg-dark-200 dark:bg-dark-700 mx-2 hidden lg:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="container-custom pt-20 lg:pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-2">
              Start Your <span className="gradient-text">Project</span>
            </h1>
            <p className="text-dark-600 dark:text-dark-300">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Step 1: Project Type */}
              {currentStep === 1 && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">What type of project?</h2>
                  <p className="text-dark-600 dark:text-dark-400 mb-8">Choose the category that best fits your vision</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectTypes.map((type, index) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => setSelectedType(type.id)}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                          selectedType === type.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-white/80 dark:bg-dark-900/80 backdrop-blur flex items-center justify-center text-2xl">
                          {type.icon}
                        </div>
                        <div className="w-10 h-10 rounded-xl mb-4" style={{ backgroundColor: type.color }} />
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{type.name}</h3>
                        <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">{type.description}</p>
                        <div className="space-y-2 mb-4">
                          {type.features.slice(0, 3).map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-500 dark:text-dark-500">Timeline: {type.timeline}</span>
                          <span className="font-bold text-dark-900 dark:text-white">${type.basePrice.toLocaleString()}+</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Step 2: Project Details */}
              {currentStep === 2 && selectedTypeData && (
                <div className="card p-6">
                  <div className="flex items-center gap-4 mb-8 p-4 rounded-xl" style={{ backgroundColor: `${selectedTypeData.color}15` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: selectedTypeData.color }}>
                      {selectedTypeData.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-dark-900 dark:text-white">{selectedTypeData.name}</h2>
                      <p className="text-dark-600 dark:text-dark-400">{selectedTypeData.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="label">Project Title *</label>
                      <input
                        id="title"
                        type="text"
                        placeholder="My Amazing 3D Portfolio"
                        value={projectDetails.title}
                        onChange={e => setProjectDetails(prev => ({ ...prev, title: e.target.value }))}
                        className="input"
                        defaultValue={prefillProject?.title || ''}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="label">Project Description *</label>
                      <textarea
                        id="description"
                        rows={4}
                        placeholder="Describe your project goals, target audience, and vision..."
                        value={projectDetails.description}
                        onChange={e => setProjectDetails(prev => ({ ...prev, description: e.target.value }))}
                        className="input resize-none"
                        defaultValue={prefillProject?.description || ''}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="requirements" className="label">Specific Requirements</label>
                      <textarea
                        id="requirements"
                        rows={3}
                        placeholder="Any specific features, integrations, or technical requirements..."
                        value={projectDetails.requirements}
                        onChange={e => setProjectDetails(prev => ({ ...prev, requirements: e.target.value }))}
                        className="input resize-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="referenceUrls" className="label">Reference URLs (Optional)</label>
                      <input
                        id="referenceUrls"
                        type="url"
                        placeholder="https://example.com - sites you like for inspiration"
                        value={projectDetails.referenceUrls}
                        onChange={e => setProjectDetails(prev => ({ ...prev, referenceUrls: e.target.value }))}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="deadline" className="label">Preferred Deadline</label>
                      <input
                        id="deadline"
                        type="date"
                        value={projectDetails.deadline}
                        onChange={e => setProjectDetails(prev => ({ ...prev, deadline: e.target.value }))}
                        className="input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Pricing */}
              {currentStep === 3 && selectedTypeData && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Choose Your Plan</h2>
                  <p className="text-dark-600 dark:text-dark-400 mb-8">Select the level of service that fits your needs</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
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
                          <span className="text-4xl font-bold text-dark-900 dark:text-white">
                            ${(selectedTypeData.basePrice * plan.multiplier).toLocaleString()}
                          </span>
                          <span className="text-dark-500 dark:text-dark-500 ml-1">one-time</span>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-dark-600 dark:text-dark-400">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedPlan(plan.id); }}
                          className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                            selectedPlan === plan.id
                              ? 'bg-primary-500 text-white hover:bg-primary-600'
                              : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                          }`}
                        >
                          {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-dark-600 dark:text-dark-400">
                        <span>Base Price ({selectedTypeData.name})</span>
                        <span>${selectedTypeData.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-dark-600 dark:text-dark-400">
                        <span>{selectedPlanData.name} Plan ({plan.multiplier}x)</span>
                        <span>+${((selectedPlanData.multiplier - 1) * selectedTypeData.basePrice).toLocaleString()}</span>
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
              
              {/* Step 4: Contact Info */}
              {currentStep === 4 && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Your Information</h2>
                  <p className="text-dark-600 dark:text-dark-400 mb-8">We'll use this to send your proposal and project updates</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="label">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={contactInfo.name}
                        onChange={e => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="label">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={contactInfo.email}
                        onChange={e => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="label">Company</label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Acme Inc."
                        value={contactInfo.company}
                        onChange={e => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="label">Phone (Optional)</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={contactInfo.phone}
                        onChange={e => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="input"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="label">Preferred Contact Method</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="email"
                            checked={contactInfo.preferredContact === 'email'}
                            onChange={e => setContactInfo(prev => ({ ...prev, preferredContact: e.target.value }))}
                            className="w-4 h-4 text-primary-600 border-dark-300 focus:ring-primary-500"
                          />
                          <span className="text-dark-700 dark:text-dark-300">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="phone"
                            checked={contactInfo.preferredContact === 'phone'}
                            onChange={e => setContactInfo(prev => ({ ...prev, preferredContact: e.target.value }))}
                            className="w-4 h-4 text-primary-600 border-dark-300 focus:ring-primary-500"
                          />
                          <span className="text-dark-700 dark:text-dark-300">Phone</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="video"
                            checked={contactInfo.preferredContact === 'video'}
                            onChange={e => setContactInfo(prev => ({ ...prev, preferredContact: e.target.value }))}
                            className="w-4 h-4 text-primary-600 border-dark-300 focus:ring-primary-500"
                          />
                          <span className="text-dark-700 dark:text-dark-300">Video Call</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 5: Review */}
              {currentStep === 5 && selectedTypeData && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Review Your Order</h2>
                  <p className="text-dark-600 dark:text-dark-400 mb-8">Please review all details before submitting</p>
                  
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                      <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: selectedTypeData.color }}>
                          {selectedTypeData.icon}
                        </span>
                        {selectedTypeData.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Project Title</p>
                          <p className="font-medium text-dark-900 dark:text-white">{projectDetails.title || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Plan</p>
                          <p className="font-medium text-dark-900 dark:text-white">{selectedPlanData.name}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Timeline</p>
                          <p className="font-medium text-dark-900 dark:text-white">{selectedTypeData.timeline}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Total Price</p>
                          <p className="font-bold text-dark-900 dark:text-white text-lg">${totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                      <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Name</p>
                          <p className="font-medium text-dark-900 dark:text-white">{contactInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Email</p>
                          <p className="font-medium text-dark-900 dark:text-white">{contactInfo.email}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Company</p>
                          <p className="font-medium text-dark-900 dark:text-white">{contactInfo.company || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-dark-500 dark:text-dark-500">Preferred Contact</p>
                          <p className="font-medium text-dark-900 dark:text-white capitalize">{contactInfo.preferredContact}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-semibold mb-1">Before you submit:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>We'll send a detailed proposal within 24 hours</li>
                            <li>A 50% deposit is required to begin work</li>
                            <li>Remaining 50% due upon project completion</li>
                            <li>All prices in USD, taxes may apply</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="fixed bottom-0 left-0 right-0 md:relative md:static bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-t border-dark-200 dark:border-dark-800 p-4 md:p-0 mt-8">
            <div className="container-custom mx-auto flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="btn-secondary px-6 py-3"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="btn-primary px-6 py-3"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary px-6 py-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Order
                      <CreditCard className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}