import React from 'react';
import { useAppContext } from '../context/AppContext';

const SubscriptionPage: React.FC = () => {
  const { user } = useAppContext();
  const pagesLeft = 100; // This should come from your user's data

  const plans = [
    {
      name: 'Basic',
      pages: 100,
      price: 20,
      description: 'Perfect for occasional document analysis',
      features: ['100 pages per month', 'Basic document analysis', 'Email support']
    },
    {
      name: 'Pro',
      pages: 500,
      price: 50,
      description: 'Ideal for regular document processing',
      features: ['500 pages per month', 'Advanced document analysis', 'Priority support']
    },
    {
      name: 'Business',
      pages: 2000,
      price: 100,
      description: 'Best for high-volume processing',
      features: ['2000 pages per month', 'Enterprise-grade analysis', '24/7 dedicated support']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">My Subscription</h1>
        <p className="text-xl text-gray-300">Choose the perfect plan for your document analysis needs</p>
      </div>

      {/* Current Usage Banner */}
      <div className="bg-gray-800 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Current Usage</h2>
            <p className="text-gray-300 mt-1">{pagesLeft} pages remaining this month</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Need more pages?</p>
            <p className="text-purple-400">Upgrade your plan below</p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="ml-2 text-gray-400">/month</span>
            </div>
            <p className="mt-4 text-gray-300">{plan.description}</p>
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Upgrade to {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Need a custom plan?</h3>
        <p className="text-gray-300">Contact us for volume pricing and custom solutions.</p>
        <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPage;