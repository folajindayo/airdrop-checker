/**
 * Header Component
 */

'use client';

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Airdrop Checker</h1>
        <nav className="flex gap-4">
          <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
          <a href="/portfolio" className="text-gray-700 hover:text-blue-600">Portfolio</a>
        </nav>
      </div>
    </header>
  );
}

