import React, { useState } from 'react';
import { Search, Play, Clock, Wrench, ShoppingCart, BookOpen, Filter } from 'lucide-react';
import { DIYResource } from '../types';
import UpgradePrompt from './UpgradePrompt';

interface DIYResourcesProps {
  resources: DIYResource[];
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
}

const DIYResources: React.FC<DIYResourcesProps> = ({ resources, userPlan, onShowPricing }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DIY Resources</h1>
          <p className="text-gray-600">Step-by-step guides and video tutorials for home maintenance tasks</p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="text-center py-20">
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">DIY Resources Coming Soon!</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're working on an amazing collection of step-by-step video tutorials, 
            interactive guides, and professional tips for all your home maintenance projects.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Coming:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">HD Video Tutorials</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Step-by-Step Photo Guides</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Tool & Material Lists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Safety Guidelines</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Professional Tips & Tricks</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Difficulty Level Filtering</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Interactive Checklists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Cost Estimation Tools</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Popular Topics We're Preparing:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'HVAC Maintenance', 'Plumbing Repairs', 'Electrical Safety', 
                'Painting Techniques', 'Deck Staining', 'Gutter Cleaning',
                'Winterization', 'Energy Efficiency', 'Landscaping', 
                'Pool Maintenance', 'Appliance Care', 'Home Security'
              ].map((topic, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-gray-500 text-sm">
              Want to be notified when DIY Resources launch? 
              <button className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Join our waitlist
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DIYResources;