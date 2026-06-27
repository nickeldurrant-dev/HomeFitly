import React from 'react';
import { Crown, ArrowRight, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { getPremiumProduct } from '../stripe-config';

interface UpgradePromptProps {
  feature: string;
  description: string;
  onDismiss: () => void;
  onUpgrade: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  description,
  onDismiss,
  onUpgrade
}) => {
  const { createCheckoutSession, loading } = useStripeCheckout();
  const [dismissedPrompts, setDismissedPrompts] = useLocalStorage<string[]>('homefitly_dismissed_prompts', []);
  
  // Don't show if already dismissed
  if (dismissedPrompts.includes(feature)) {
    return null;
  }

  const handleUpgrade = async () => {
    onUpgrade();
  };
  
  const handleDismiss = () => {
    setDismissedPrompts(prev => [...prev, feature]);
    onDismiss();
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Crown className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Unlock {feature}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {description}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Upgrade to Premium</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <span className="text-sm text-gray-500">$4.99/month</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;