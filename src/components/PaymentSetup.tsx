import React, { useState } from 'react';
import { CreditCard, Smartphone, Shield, Lock, Check, AlertTriangle } from 'lucide-react';
import { PaymentMethod, BillingInfo } from '../types';

interface PaymentSetupProps {
  onAddPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => void;
  onUpdateBilling: (billing: BillingInfo) => void;
  existingMethods: PaymentMethod[];
  billingInfo?: BillingInfo;
}

const PaymentSetup: React.FC<PaymentSetupProps> = ({
  onAddPaymentMethod,
  onUpdateBilling,
  existingMethods,
  billingInfo
}) => {
  const [activeTab, setActiveTab] = useState<'credit_card' | 'paypal' | 'apple_pay'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [billing, setBilling] = useState<BillingInfo>(billingInfo || {
    firstName: '',
    lastName: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate secure payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would integrate with Stripe, Square, or similar
      const paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'> = {
        type: 'credit_card',
        isDefault: existingMethods.length === 0,
        lastFour: cardForm.number.slice(-4),
        brand: detectCardBrand(cardForm.number),
        expiryMonth: parseInt(cardForm.expiry.split('/')[0]),
        expiryYear: parseInt('20' + cardForm.expiry.split('/')[1])
      };

      onAddPaymentMethod(paymentMethod);
      onUpdateBilling(billing);
      
      // Clear form
      setCardForm({ number: '', expiry: '', cvc: '', name: '' });
      
    } catch (error) {
      console.error('Payment setup failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSetup = async () => {
    setIsProcessing(true);
    try {
      // Simulate PayPal OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'> = {
        type: 'paypal',
        isDefault: existingMethods.length === 0,
        email: billing.email
      };

      onAddPaymentMethod(paymentMethod);
      onUpdateBilling(billing);
      
    } catch (error) {
      console.error('PayPal setup failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePaySetup = async () => {
    setIsProcessing(true);
    try {
      // Check if Apple Pay is available
      if (!window.ApplePaySession?.canMakePayments()) {
        throw new Error('Apple Pay not available');
      }

      // Simulate Apple Pay setup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'> = {
        type: 'apple_pay',
        isDefault: existingMethods.length === 0
      };

      onAddPaymentMethod(paymentMethod);
      onUpdateBilling(billing);
      
    } catch (error) {
      console.error('Apple Pay setup failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    if (cleaned.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Secure Payment Processing</h3>
            <p className="text-sm text-green-700">
              Your payment information is encrypted and securely processed. We never store your full card details.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('credit_card')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'credit_card'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="h-5 w-5 mx-auto mb-1" />
              Credit Card
            </button>
            <button
              onClick={() => setActiveTab('paypal')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'paypal'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-5 h-5 mx-auto mb-1 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                P
              </div>
              PayPal
            </button>
            <button
              onClick={() => setActiveTab('apple_pay')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'apple_pay'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="h-5 w-5 mx-auto mb-1" />
              Apple Pay
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Credit Card Form */}
          {activeTab === 'credit_card' && (
            <form onSubmit={handleCardSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardForm.number}
                    onChange={(e) => setCardForm({
                      ...cardForm,
                      number: formatCardNumber(e.target.value)
                    })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({
                        ...cardForm,
                        expiry: formatExpiry(e.target.value)
                      })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm({
                        ...cardForm,
                        cvc: e.target.value.replace(/\D/g, '')
                      })}
                      placeholder="123"
                      maxLength={4}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Add Card Securely</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* PayPal Setup */}
          {activeTab === 'paypal' && (
            <div className="text-center space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect PayPal</h3>
                <p className="text-gray-600 text-sm">
                  Securely connect your PayPal account for easy payments
                </p>
              </div>

              <button
                onClick={handlePayPalSetup}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Connect PayPal Account</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Apple Pay Setup */}
          {activeTab === 'apple_pay' && (
            <div className="text-center space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Apple Pay</h3>
                <p className="text-gray-600 text-sm">
                  Use Touch ID or Face ID for secure, convenient payments
                </p>
              </div>

              <button
                onClick={handleApplePaySetup}
                disabled={isProcessing}
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Set up Apple Pay</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={billing.firstName}
              onChange={(e) => setBilling({
                ...billing,
                firstName: e.target.value
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={billing.lastName}
              onChange={(e) => setBilling({
                ...billing,
                lastName: e.target.value
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={billing.email}
              onChange={(e) => setBilling({
                ...billing,
                email: e.target.value
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={billing.address.line1}
              onChange={(e) => setBilling({
                ...billing,
                address: { ...billing.address, line1: e.target.value }
              })}
              placeholder="Street address"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={billing.address.city}
              onChange={(e) => setBilling({
                ...billing,
                address: { ...billing.address, city: e.target.value }
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={billing.address.state}
              onChange={(e) => setBilling({
                ...billing,
                address: { ...billing.address, state: e.target.value }
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={billing.address.postalCode}
              onChange={(e) => setBilling({
                ...billing,
                address: { ...billing.address, postalCode: e.target.value }
              })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">256-bit SSL</h4>
          <p className="text-sm text-gray-600">Bank-level encryption</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">PCI Compliant</h4>
          <p className="text-sm text-gray-600">Secure payment processing</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">No Storage</h4>
          <p className="text-sm text-gray-600">Card details never stored</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSetup;