/**
 * AirdropCard Component
 */

'use client';

interface Airdrop {
  id: string;
  name: string;
  token: string;
  amount: string;
  eligibility: boolean;
  claimUrl: string;
}

interface AirdropCardProps {
  airdrop: Airdrop;
}

export function AirdropCard({ airdrop }: AirdropCardProps) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{airdrop.name}</h3>
          <p className="text-gray-600">{airdrop.token}</p>
        </div>
        {airdrop.eligibility && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Eligible
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-blue-600 mb-4">{airdrop.amount}</p>
      {airdrop.eligibility && (
        <a
          href={airdrop.claimUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Claim Now
        </a>
      )}
    </div>
  );
}

