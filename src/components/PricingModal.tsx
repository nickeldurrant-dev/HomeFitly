import React from 'react';
import { X, Check, Star, Crown } from 'lucide-react';
import { getPremiumProduct } from '../stripe-config';
import { useStripeCheckout } from '../hooks/useStripeCheckout';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  accessToken?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  isPremium,
  accessToken
}) => {
  const { createCheckoutSession, loading } = useStripeCheckout();

  const handleUpgrade = async () => {
    if (isPremium) {
      onClose();
      return;
    }
    const premiumProduct = getPremiumProduct();
    await createCheckoutSession({
      priceId: premiumProduct.priceId,
      mode: premiumProduct.mode
    });
  };

  if (!isOpen) return null;

  const premiumProduct = getPremiumProduct();
  const features = [
    'Unlimited tasks and checklists',
    'Smart reminders & notifications',
    'Advanced warranty tracking',
    'Cloud document storage',
    'Priority customer support',
    'Export data functionality',
    'Custom categories & tags'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isPremium ? 'You\'re Premium!' : 'Upgrade to Premium'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isPremium 
                    ? 'You have access to all premium features' 
                    : 'Unlock all features to better manage your home'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{premiumProduct.name}</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-4xl font-bold text-gray-900">${premiumProduct.price}</span>
                <span className="text-gray-600 ml-1">/{premiumProduct.interval}</span>
              </div>
              <p className="text-gray-600 max-w-md mx-auto">{premiumProduct.description}</p>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">Everything you need to manage your home:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isPremium && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">🎉 Get Started Today</h4>
                  <p className="text-gray-600 text-sm">
                    Subscribe to Premium and unlock all features instantly. Cancel anytime, no questions asked.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={isPremium ? onClose : handleUpgrade}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all text-lg ${
                isPremium
                  ? 'bg-gray-100 text-gray-600 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : isPremium ? (
                'You\'re all set!'
              ) : (
                'Subscribe to Premium'
              )}
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isPremium 
                  ? 'Manage your subscription in Settings'
                  : 'Instant access • Cancel anytime • No hidden fees'
                }
              </p>
              {!isPremium && (
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
                  <span>✓ Secure payments</span>
                  <span>✓ No hidden fees</span>
                  <span>✓ Cancel anytime</span>
                </div>
              )}
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default PricingModal;