import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Instagram, Linkedin, Globe } from 'lucide-react';
import { api } from '../api/client.js';

export const ContactView: React.FC = () => {
  const { data, showToast } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check query params for prefilled subject (e.g. from artwork detail page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subj = params.get('subject');
    if (subj) {
      setFormData(prev => ({ ...prev, subject: subj }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.sendContactMessage(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      showToast('Your message has been delivered to Oliva Biswas studio.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again or email directly.');
      showToast('Failed to send message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div id="contact-view" className="w-full max-w-4xl pb-24">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-6 mb-10">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
          Contact
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Studio Info & Channels */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">
              Studio Representation
            </h2>
            <p className="text-base text-neutral-800 font-serif leading-relaxed">
              For acquisition inquiries, exhibition loan requests, catalog raisonné questions, or studio visits:
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-0.5">
                  Direct Inquiries
                </span>
                <a
                  href={`mailto:${data?.settings.contactEmail || 'studio@olivabiswas.com'}`}
                  className="text-neutral-900 hover:underline underline-offset-4 font-light"
                >
                  {data?.settings.contactEmail || 'studio@olivabiswas.com'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-0.5">
                  Studio Locations
                </span>
                <span className="text-neutral-800 font-light">
                  {data?.settings.studioLocation || 'Paris / New York'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Platforms */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Official Platforms
            </h3>
            <div className="flex flex-col gap-3">
              {data?.socialLinks?.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-xs tracking-wider text-neutral-700 hover:text-black transition-colors"
                >
                  {getSocialIcon(link.platform)}
                  <span>{link.label || link.platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-neutral-200 shadow-xs">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-neutral-900 mx-auto" />
              <h3 className="font-serif text-2xl text-neutral-900">Message Received</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                Thank you for your correspondence. The studio will review your message and reply promptly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 px-6 py-2.5 text-xs uppercase tracking-widest border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 block">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                    placeholder="Full name or institution"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 block">
                    Your Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 block">
                  Subject / Inquiry Type
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-neutral-50 border border-neutral-300 px-4 py-2.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                  placeholder="Artwork inquiry, exhibition proposal, press, etc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 block">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-neutral-50 border border-neutral-300 p-4 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors leading-relaxed"
                  placeholder="Please write your inquiry here..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting...' : 'Send Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
