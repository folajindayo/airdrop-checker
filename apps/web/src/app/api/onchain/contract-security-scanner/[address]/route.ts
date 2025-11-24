import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

// Security-related bytecode patterns
const SECURITY_PATTERNS = {
  SELFDESTRUCT: 'ff', // SELFDESTRUCT opcode
  DELEGATECALL: 'f4', // DELEGATECALL opcode
  CALLCODE: 'f2', // CALLCODE opcode (deprecated)
  REENTRANCY_GUARD: '5c60da1b', // ReentrancyGuard pattern
  PAUSABLE: '8456cb59', // Pausable pattern
  OWNABLE: '8da5cb5b', // Ownable pattern
  ERC20: '18160ddd', // ERC20 totalSupply
  ERC721: '80ac58cd', // ERC721 interface
  ERC1155: '00fdd58e', // ERC1155 interface
};

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/contract-security-scanner/[address]
 * Scan on-chain smart contract for security patterns and vulnerabilities
 * Provides comprehensive security analysis of contract bytecode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-security-scanner:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? chains.filter((c) => c.id === parseInt(chainId))
      : chains;

    const securityResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const bytecode = await publicClient.getBytecode({
            address: normalizedAddress,
          });

          const isContract = bytecode && bytecode !== '0x' && bytecode.length > 2;
          
          if (!isContract) {
            securityResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              contractAddress: normalizedAddress,
              isContract: false,
              message: 'Address is not a contract',
            });
            continue;
          }

          // Scan for security patterns
          const patterns = {
            hasSelfDestruct: bytecode.includes(SECURITY_PATTERNS.SELFDESTRUCT),
            hasDelegateCall: bytecode.includes(SECURITY_PATTERNS.DELEGATECALL),
            hasCallCode: bytecode.includes(SECURITY_PATTERNS.CALLCODE),
            hasReentrancyGuard: bytecode.includes(SECURITY_PATTERNS.REENTRANCY_GUARD),
            hasPausable: bytecode.includes(SECURITY_PATTERNS.PAUSABLE),
            hasOwnable: bytecode.includes(SECURITY_PATTERNS.OWNABLE),
            hasERC20: bytecode.includes(SECURITY_PATTERNS.ERC20),
            hasERC721: bytecode.includes(SECURITY_PATTERNS.ERC721),
            hasERC1155: bytecode.includes(SECURITY_PATTERNS.ERC1155),
          };

          // Security assessment
          const vulnerabilities: string[] = [];
          const securityFeatures: string[] = [];

          if (patterns.hasSelfDestruct) {
            vulnerabilities.push('Self-destruct capability detected');
          }
          if (patterns.hasDelegateCall) {
            vulnerabilities.push('DelegateCall usage detected (high risk)');
          }
          if (patterns.hasCallCode) {
            vulnerabilities.push('CallCode usage detected (deprecated, high risk)');
          }

          if (patterns.hasReentrancyGuard) {
            securityFeatures.push('ReentrancyGuard protection');
          }
          if (patterns.hasPausable) {
            securityFeatures.push('Pausable functionality');
          }
          if (patterns.hasOwnable) {
            securityFeatures.push('Ownable access control');
          }

          // Risk level calculation
          let riskLevel = 'low';
          if (patterns.hasSelfDestruct || patterns.hasDelegateCall || patterns.hasCallCode) {
            riskLevel = 'high';
          } else if (vulnerabilities.length > 0) {
            riskLevel = 'medium';
          }

          // Security score (0-100)
          let securityScore = 100;
          if (patterns.hasSelfDestruct) securityScore -= 30;
          if (patterns.hasDelegateCall) securityScore -= 25;
          if (patterns.hasCallCode) securityScore -= 25;
          if (!patterns.hasReentrancyGuard && patterns.hasERC20) securityScore -= 10;
          if (!patterns.hasOwnable) securityScore -= 10;

          securityResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            isContract: true,
            codeSize: bytecode.length,
            patterns,
            security: {
              riskLevel,
              securityScore: Math.max(0, Math.min(100, securityScore)),
              vulnerabilities,
              securityFeatures,
              recommendations: [
                ...(patterns.hasSelfDestruct ? ['Consider removing self-destruct functionality'] : []),
                ...(patterns.hasDelegateCall && !patterns.hasOwnable ? ['Add access control for delegateCall usage'] : []),
                ...(!patterns.hasReentrancyGuard && patterns.hasERC20 ? ['Consider adding ReentrancyGuard'] : []),
                ...(!patterns.hasOwnable ? ['Consider adding access control'] : []),
              ],
            },
            analysis: {
              contractType: patterns.hasERC1155
                ? 'ERC1155'
                : patterns.hasERC721
                ? 'ERC721'
                : patterns.hasERC20
                ? 'ERC20'
                : 'Unknown',
              hasSecurityFeatures: securityFeatures.length > 0,
              hasVulnerabilities: vulnerabilities.length > 0,
            },
          });
        } catch (error) {
          console.error(`Error scanning contract on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching security data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      securityResults,
      totalResults: securityResults.length,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain contract security scanner API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan on-chain contract security',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

