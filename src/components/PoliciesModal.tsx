import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PoliciesModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8 p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#2B1E16]/10 pb-3">
          <div className="flex items-center gap-2">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-[#9E7D47]" />
            ) : (
              <FileText className="w-5 h-5 text-[#9E7D47]" />
            )}
            <h3 className="font-serif text-xl font-bold text-[#1C130D]">
              {type === 'privacy' ? 'Privacy Policy' : 'Booking Terms & Cancellation Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#2B1E16]/60 hover:text-[#1C130D] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto space-y-4 text-xs sm:text-sm text-[#2B1E16]/80 leading-relaxed pr-2">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>ASVILLA</strong> ("we", "our", or "hotel") is committed to protecting the personal privacy and data of our guests. This Privacy Policy describes how we handle guest information collected during room bookings.
              </p>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">1. Information We Collect</h4>
                <p>
                  When reserving a chamber at ASVILLA, we collect your full name, email address, contact telephone number, payment preference (Cash on Delivery or UPI transfer reference), and stay dates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">2. Purpose of Collection</h4>
                <p>
                  Your information is exclusively utilized to confirm and service your hotel stay, fulfill statutory police verification mandates for hotel guests in Uttar Pradesh, and send reservation updates. We do not sell or lease guest information to third parties.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">3. Data Security &amp; Storage</h4>
                <p>
                  All account and booking records are stored in enterprise-grade encrypted databases provided by Supabase with Row Level Security (RLS) policies. Payment details are handled manually via NPCI UPI protocol or in-person at check-in.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">1. Check-In &amp; Check-Out Hours</h4>
                <p>
                  Standard check-in begins at <strong>12:00 PM (Noon)</strong>. Check-out is scheduled until <strong>11:00 AM</strong>. Early check-in or late check-out is subject to room availability upon arrival.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">2. Cancellation &amp; Refund Policy</h4>
                <p>
                  Guests may cancel their reservation at zero charge up to 48 hours prior to scheduled check-in through their online dashboard. For cancellations made within 48 hours of arrival or non-arrivals (no-shows), one night’s room tariff may apply.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">3. Payment Methods</h4>
                <p>
                  ASVILLA offers two verified payment choices:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Pay at Hotel (COD):</strong> Reserve your room online without advance charge; pay full tariff upon check-in.</li>
                  <li><strong>UPI QR Payment:</strong> Transfer directly using UPI ID <code className="font-mono text-xs bg-[#FAF8F5] px-1 py-0.5 rounded">8081144350-4@ybl</code>. The front desk verifies your transaction reference number.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C130D] mb-1">4. Identification Requirement</h4>
                <p>
                  In accordance with Government of India and Uttar Pradesh hotel regulations, all adult occupants must present a valid government-issued photo identity proof (Aadhaar, Passport, Voter ID, or Driving License) during registration.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-[#2B1E16]/10 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
