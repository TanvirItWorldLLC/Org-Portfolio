import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Clock, Send, Loader2 } from 'lucide-react'
import { Scene3D } from '../components/three/Scene3D'
import toast from 'react-hot-toast'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@orgportfolio.com',
    description: 'We typically respond within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'San Francisco, CA',
    description: 'Or anywhere via video call',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+1 (555) 123-4567',
    description: 'Mon-Fri, 9am-6pm PST',
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: 'Under 24 hours',
    description: 'We take every inquiry seriously',
  },
]

const formFields = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
  { name: 'company', label: 'Company (Optional)', type: 'text', placeholder: 'Acme Inc.' },
  { name: 'budget', label: 'Project Budget', type: 'select', options: ['', 'Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000 - $100,000', '$100,000+'] },
  { name: 'timeline', label: 'Timeline', type: 'select', options: ['', 'ASAP', '1-2 months', '3-6 months', '6+ months', 'Just exploring'] },
  { name: 'message', label: 'Project Details', type: 'textarea', placeholder: 'Tell us about your project, goals, and any specific requirements...', required: true, rows: 5 },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', company: '', budget: '', timeline: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <>
      <Scene3D className="opacity-50" />
      
      <div className="relative z-10 min-h-screen bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
        <div className="container-custom py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
              Let's <span className="gradient-text">Work Together</span>
            </h1>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl">
              Have a project in mind? We'd love to hear about it. Fill out the form or reach out directly.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 space-y-8"
            >
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                      <info.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-1">{info.title}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">{info.value}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-500">{info.description}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card p-6 bg-gradient-to-br from-primary-500/10 to-primary-700/10 border-primary-200 dark:border-primary-800"
              >
                <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/portfolio" className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    View Portfolio
                  </a>
                  <a href="/order" className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    Start a Project
                  </a>
                  <a href="/about" className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Learn More About Us
                  </a>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="card p-8" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div key={field.name} className={field.name === 'message' ? 'md:col-span-2' : ''}>
                      <label htmlFor={field.name} className="label">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                      {field.type === 'select' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="input"
                          required={field.required}
                        >
                          {field.options.map((option, i) => (
                            <option key={i} value={option}>{option || `Select ${field.label}`}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="input resize-none"
                          rows={field.rows}
                          required={field.required}
                        />
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="input"
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 sm:flex-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-sm text-dark-500 dark:text-dark-500">
                    By submitting, you agree to our <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}