/**
 * Footer Component
 */

'use client';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <p>&copy; 2024 Airdrop Checker. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-blue-400">Terms</a>
            <a href="/privacy" className="hover:text-blue-400">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

