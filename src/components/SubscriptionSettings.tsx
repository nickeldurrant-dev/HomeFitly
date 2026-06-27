import React, { useState } from 'react';
import { Crown, CreditCard, Calendar, AlertTriangle, Check, X } from 'lucide-react';
import { UserSubscription, SubscriptionPlan, PaymentMethod } from '../types';
import { getPremiumProduct } from '../stripe-config';

interface SubscriptionSettingsProps {
  userSubscription: UserSubscription;
  subscriptionPlans: SubscriptionPlan[];
  onUpdateSubscription: (subscription: UserSubscription) => void;
  onShowPricing: () => void;
  onShowPaymentSetup: () => void;
  paymentMethods: PaymentMethod[];
}

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({
  userSubscription,
  subscriptionPlans,
  onUpdateSubscription,
  onShowPricing,
  onShowPaymentSetup,
  paymentMethods
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const premiumProduct = getPremiumProduct();

  const currentPlan = subscriptionPlans.find(plan => plan.id === userSubscription.plan);
  const isExpiringSoon = userSubscription.expiresAt && 
    new Date(userSubscription.expiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  const handleCancelSubscription = () => {
    onUpdateSubscription({
      ...userSubscription,
      cancelAtPeriodEnd: true
    });
    setShowCancelModal(false);
  };

  const handleReactivateSubscription = () => {
    onUpdateSubscription({
      ...userSubscription,
      cancelAtPeriodEnd: false
    });
    setShowReactivateModal(false);
  };

  const CancelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Subscription</h3>
              <p className="text-gray-600 text-sm">Are you sure you want to cancel?</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">You'll lose access to:</h4>
            <ul className="space-y-2">
              {currentPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>Good news:</strong> Your subscription will remain active until{' '}
              {userSubscription.expiresAt && new Date(userSubscription.expiresAt).toLocaleDateString()}.
              You can reactivate anytime before then.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowCancelModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancelSubscription}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );

  const ReactivateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Crown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Reactivate Subscription</h3>
              <p className="text-gray-600 text-sm">Welcome back to Premium!</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">You'll regain access to:</h4>
            <ul className="space-y-2">
              {currentPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              Your subscription will continue at ${premiumProduct.price}/{premiumProduct.interval} and auto-renew until you cancel again.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowReactivateModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleReactivateSubscription}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reactivate Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Settings</h1>
        <p className="text-gray-600">Manage your HomeFitly subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {userSubscription.plan === 'premium' && <Crown className="h-6 w-6 text-yellow-500" />}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {userSubscription.plan === 'premium' ? premiumProduct.name : 'Free Plan'}
              </h3>
              {userSubscription.plan === 'premium' && (
                <p className="text-gray-600">${premiumProduct.price}/{premiumProduct.interval}</p>
              )}
            </div>
          </div>
          
          {userSubscription.plan === 'free' ? (
            <button
              onClick={onShowPricing}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade to Premium</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              {userSubscription.cancelAtPeriodEnd ? (
                <button
                  onClick={() => setShowReactivateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reactivate
                </button>
              ) : (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          )}
        </div>

        {/* Subscription Status */}
        {userSubscription.plan === 'premium' && (
          <div className="space-y-4">
            {userSubscription.cancelAtPeriodEnd && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Subscription Ending</span>
                </div>
                <p className="text-orange-700 text-sm mt-1">
                  Your subscription will end on{' '}
                  {userSubscription.expiresAt && new Date(userSubscription.expiresAt).toLocaleDateString()}.
                  You'll be downgraded to the free plan.
                </p>
              </div>
            )}

            {isExpiringSoon && !userSubscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Renewal Coming Up</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Your subscription will renew on{' '}
                  {userSubscription.expiresAt && new Date(userSubscription.expiresAt).toLocaleDateString()}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  userSubscription.cancelAtPeriodEnd ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {userSubscription.cancelAtPeriodEnd ? 'Ending' : 'Active'}
                </span>
              </div>
              
              {userSubscription.expiresAt && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">
                    {userSubscription.cancelAtPeriodEnd ? 'Ends:' : 'Renews:'}
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(userSubscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className={`p-4 rounded-lg border-2 ${
              plan.id === userSubscription.plan 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 capitalize flex items-center space-x-2">
                  {plan.id === 'premium' && <Crown className="h-4 w-4 text-yellow-500" />}
                  <span>{plan.name}</span>
                </h4>
                <span className="text-lg font-bold text-gray-900">
                  ${plan.price}{plan.price > 0 && '/mo'}
                </span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      {userSubscription.plan === 'premium' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
          
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      {method.type === 'credit_card' && (
                        <>
                          <p className="font-medium text-gray-900">•••• •••• •••• {method.lastFour}</p>
                          <p className="text-sm text-gray-600">{method.brand} • Expires {method.expiryMonth}/{method.expiryYear}</p>
                        </>
                      )}
                      {method.type === 'paypal' && (
                        <>
                          <p className="font-medium text-gray-900">PayPal</p>
                          <p className="text-sm text-gray-600">{method.email}</p>
                        </>
                      )}
                      {method.type === 'apple_pay' && (
                        <>
                          <p className="font-medium text-gray-900">Apple Pay</p>
                          <p className="text-sm text-gray-600">Touch ID / Face ID</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={onShowPaymentSetup}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                + Add Payment Method
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h4>
              <p className="text-gray-600 mb-4">Add a payment method to manage your subscription</p>
              <button
                onClick={onShowPaymentSetup}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download Billing History
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCancelModal && <CancelModal />}
      {showReactivateModal && <ReactivateModal />}
    </div>
  );
};

export default SubscriptionSettings;