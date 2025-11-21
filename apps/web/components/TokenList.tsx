/**
 * TokenList Component
 */

'use client';

interface Token {
  address: string;
  symbol: string;
  balance: string;
  value: number;
  logo?: string;
}

interface TokenListProps {
  tokens: Token[];
  onTokenClick?: (token: Token) => void;
}

export function TokenList({ tokens, onTokenClick }: TokenListProps) {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tokens found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tokens.map((token) => (
        <div
          key={token.address}
          onClick={() => onTokenClick?.(token)}
          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-blue-500 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {token.symbol[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{token.symbol}</p>
              <p className="text-sm text-gray-500">{token.balance}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${token.value.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

