import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    }, 700);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9E7D47] mb-2">
            Connect With Front Desk
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C130D] mb-4">
            Contact ASVILLA
          </h2>
          <p className="text-sm sm:text-base text-[#2B1E16]/75">
            Have questions regarding room reservations, group bookings, or special arrival requests? Our front desk team is at your service 24 hours a day.
          </p>
        </div>

        {/* 2-Column Grid: Contact Information & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-12">
          
          {/* Left Column: Direct Contact Details & Timings */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-[#2B1E16]/10 p-6 sm:p-8 shadow-sm">
            <div>
              <h3 className="font-serif text-2xl font-medium text-[#1C130D] mb-6">
                Hotel Information
              </h3>

              <div className="space-y-6 text-sm text-[#2B1E16]/85">
                
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1C130D]">Hotel Address</div>
                    <p className="text-xs sm:text-sm text-[#2B1E16]/75 mt-0.5 leading-relaxed">
                      ASVILLA Heritage Hotel, B-3/42 Ravindrapuri, Near Assi Ghat Road, Varanasi, Uttar Pradesh 221005, India
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1C130D]">Phone &amp; WhatsApp</div>
                    <a
                      href="tel:+918081144350"
                      className="text-xs sm:text-sm text-[#9E7D47] hover:underline font-medium block mt-0.5"
                    >
                      +91 80811 44350
                    </a>
                    <span className="text-[11px] text-[#2B1E16]/60">Available 24/7 for guest assistance</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1C130D]">Email Inquiries</div>
                    <a
                      href="mailto:reservations@asvilla.com"
                      className="text-xs sm:text-sm text-[#9E7D47] hover:underline font-medium block mt-0.5"
                    >
                      reservations@asvilla.com
                    </a>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1C130D]">Check-In / Check-Out Hours</div>
                    <div className="text-xs text-[#2B1E16]/75 mt-0.5">
                      Check-In: 12:00 PM · Check-Out: 11:00 AM
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2B1E16]/10 text-xs text-[#2B1E16]/65">
              <span>UPI Payment ID: </span>
              <strong className="text-[#1C130D] font-mono">8081144350-4@ybl</strong>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#2B1E16]/10 p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-2xl font-medium text-[#1C130D] mb-2">
              Send an Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-[#2B1E16]/75 mb-6">
              Fill out the form below and our reservation concierge will reply within 2 hours.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#9E7D47]/10 rounded-xl border border-[#9E7D47]/30 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#9E7D47] mx-auto mb-3" />
                <h4 className="font-serif text-xl font-semibold text-[#1C130D] mb-1">
                  Message Dispatched Successfully
                </h4>
                <p className="text-xs text-[#2B1E16]/80 max-w-md mx-auto">
                  Thank you for reaching out to ASVILLA. Our reservations manager has received your note and will contact you promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Anand Sharma"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="youremail@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Reservation Message / Request *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Let us know your estimated arrival time, questions regarding room categories, or special dietary requirements..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Google Maps Location Embed */}
        <div className="bg-white rounded-xl border border-[#2B1E16]/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#2B1E16]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C130D]">
              <MapPin className="w-4 h-4 text-[#9E7D47]" />
              <span>ASVILLA Location · Ravindrapuri, Varanasi, Uttar Pradesh</span>
            </div>
            <span className="text-[11px] text-[#2B1E16]/60">Varanasi, India</span>
          </div>
          <div className="w-full h-72 sm:h-88 bg-[#EAE1D9]">
            <iframe
              title="ASVILLA Varanasi Map Location"
              src="https://maps.google.com/maps?q=Ravindrapuri,%20Varanasi,%20Uttar%20Pradesh%20221005&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
