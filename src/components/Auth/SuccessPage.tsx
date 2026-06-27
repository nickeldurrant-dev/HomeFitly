import React, { useEffect, useState } from 'react';
import { CheckCircle, Home, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProductByPriceId, getPremiumProduct } from '../../stripe-config';

interface SuccessPageProps {
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else if (data) {
          setSubscriptionData(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const getProductInfo = () => {
    if (subscriptionData?.price_id) {
      return getProductByPriceId(subscriptionData.price_id);
    }
    // Fallback to premium product if no price_id found
    return getPremiumProduct();
  };

  const productInfo = getProductInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Welcome to HomeFitly Premium</p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your subscription details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Details */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {productInfo.name}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {productInfo.description}
                </p>
                
                {subscriptionData && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Subscription Status:</strong> {subscriptionData.subscription_status === 'active' ? 'Active' : subscriptionData.subscription_status}
                    </p>
                    {subscriptionData.current_period_end && (
                      <p className="text-sm text-green-700 mt-1">
                        <strong>Next billing:</strong> {new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Premium Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">You now have access to:</h3>
                <ul className="space-y-2">
                  {[
                    'Unlimited tasks and checklists',
                    'Smart reminders & notifications',
                    'Advanced warranty tracking',
                    'Premium DIY guides & tutorials',
                    'Cloud document storage',
                    'Priority customer support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What's next?</h4>
                <p className="text-blue-800 text-sm">
                  Start by setting up your home profile and creating your first maintenance checklist. 
                  Our smart recommendations will help you keep your home in perfect condition.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-2 text-lg"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-gray-500 font-medium">HomeFitly</span>
          </div>
          <p className="text-sm text-gray-500">
            Questions? Contact our support team anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;