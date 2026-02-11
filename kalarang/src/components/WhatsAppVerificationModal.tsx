import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  sendOTP,
  verifyOTP,
  saveWhatsAppNumber,
  formatPhoneNumber,
} from '../services/whatsappOtp';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import './WhatsAppVerificationModal.css';

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneNumber: string) => void;
}


const WhatsAppVerificationModal: React.FC<WhatsAppVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {

  const { appUser } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize reCAPTCHA when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Clean up existing verifier
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.log('Error clearing previous reCAPTCHA:', e);
      }
      (window as any).recaptchaVerifier = null;
    }

    // Initialize reCAPTCHA with retry logic
    const initializeRecaptcha = (attempt = 0) => {
      const container = document.getElementById('recaptcha-container');
      
      if (!container) {
        if (attempt < 10) {
          // Retry up to 10 times with 100ms delay
          setTimeout(() => initializeRecaptcha(attempt + 1), 100);
        } else {
          console.error('❌ reCAPTCHA container not found after multiple attempts');
        }
        return;
      }

      try {
        const recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              console.log('✅ reCAPTCHA verified');
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA expired');
            },
          }
        );

        (window as any).recaptchaVerifier = recaptchaVerifier;
        console.log('✅ reCAPTCHA initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing reCAPTCHA:', error);
      }
    };

    // Start initialization with a small delay
    const timer = setTimeout(() => initializeRecaptcha(), 50);

    // Cleanup on unmount or modal close
    return () => {
      clearTimeout(timer);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {
          console.log('Error cleaning up reCAPTCHA:', e);
        }
      }
    };
  }, [isOpen]);

  const handleSendOTP = async () => {
    setError('');
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber, countryCode);
      console.log('📱 Sending OTP to:', formattedNumber);
      
      await sendOTP(formattedNumber);
      
      console.log('✅ OTP sent successfully');
      setStep('otp');
    } catch (err: any) {
      console.error('❌ Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const verifiedNumber = await verifyOTP(otp);
      
      if (appUser?.uid) {
        await saveWhatsAppNumber(appUser.uid, verifiedNumber);
        onVerified(verifiedNumber);
        handleClose();
      }
    } catch (err: any) {
      console.error('❌ Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      
      <div className={`modal-content ${theme}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>Verify WhatsApp Number</h2>
          <p className="modal-subtitle">
            {step === 'phone'
              ? 'Enter your WhatsApp number to receive an OTP via SMS'
              : 'Enter the 6-digit OTP sent to your phone'}
          </p>
        </div>

        <div className="modal-body">
          {step === 'phone' ? (
            <div className="phone-input-section">
              <div className="phone-input-group">
                <select
                  className="country-code-select"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={loading}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  className="phone-input"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  disabled={loading}
                  maxLength={10}
                />
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <button
                className="primary-button"
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="help-section">
                <p className="help-text">
                  💡 <strong>Common Issues:</strong>
                </p>
                <ol className="help-list">
                  <li><strong>Phone Auth:</strong> Enable in <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console</a> → Authentication → Sign-in method</li>
                  <li><strong>Billing:</strong> Phone Auth requires Blaze (pay-as-you-go) plan</li>
                  <li><strong>Testing:</strong> Add test numbers in Authentication → Settings → Phone numbers for testing</li>
                  <li><strong>Domain:</strong> Ensure localhost is in authorized domains list</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="otp-input-section">
              <input
                type="text"
                className="otp-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                disabled={loading}
                maxLength={6}
              />
              
              {error && <p className="error-message">{error}</p>}
              
              <button
                className="primary-button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button
                className="secondary-button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                disabled={loading}
              >
                Change Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppVerificationModal;
