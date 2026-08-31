'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Mailto fallback (no SMTP configured by default)
    const mailto = `mailto:hello@orgportfolio.com?subject=${encodeURIComponent(
      `[Contact] ${form.subject}`,
    )}&body=${encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`)}`;
    window.location.href = mailto;
    setTimeout(() => {
      setSending(false);
      toast.success('Opening your email client...');
    }, 500);
  }

  return (
    <div className="container-custom py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300">
          Have a project in mind? We&apos;d love to hear about it. Drop us a line and we&apos;ll get back within 24 hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Send us a message</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <input
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input"
                placeholder="Project enquiry"
              />
            </div>

            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            <button type="submit" disabled={sending} className="btn-primary">
              {sending ? 'Opening...' : 'Send message'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card">
            <Mail className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-dark-900 dark:text-white mb-1">Email</h3>
            <a href="mailto:hello@orgportfolio.com" className="text-primary-600 dark:text-primary-400 hover:underline">
              hello@orgportfolio.com
            </a>
          </div>
          <div className="card">
            <Phone className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-dark-900 dark:text-white mb-1">Phone</h3>
            <p className="text-dark-600 dark:text-dark-400">+1 (555) 123-4567</p>
          </div>
          <div className="card">
            <MapPin className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-dark-900 dark:text-white mb-1">Office</h3>
            <p className="text-dark-600 dark:text-dark-400">
              123 Creative Avenue<br />
              San Francisco, CA 94102
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}