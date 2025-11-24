/**
 * Home Page
 */

'use client';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Check Your Airdrop Eligibility
          </h1>
          <p className="text-xl text-gray-600">
            Track airdrops across multiple chains in one place
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <input
              type="text"
              placeholder="Enter wallet address or ENS name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              Check Eligibility
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
