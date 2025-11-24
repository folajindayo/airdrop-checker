/**
 * Smart Contract Security Scanner - Advanced vulnerability detection
 * Analyzes bytecode patterns, common exploits, and security best practices
 */

interface ContractCode {
  address: string;
  bytecode: string;
  sourceCode?: string;
  abi?: any[];
  compiler?: string;
  optimizationUsed?: boolean;
}

interface SecurityVulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  name: string;
  description: string;
  location?: string;
  recommendation: string;
  cve?: string; // Common Vulnerabilities and Exposures ID
  exploitability: number; // 0-100
}

interface SecurityAuditReport {
  contractAddress: string;
  overallScore: number; // 0-100
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: SecurityVulnerability[];
  securityPatterns: Array<{
    pattern: string;
    implemented: boolean;
    importance: 'critical' | 'high' | 'medium' | 'low';
  }>;
  recommendations: string[];
  auditTimestamp: number;
}

interface FunctionAnalysis {
  selector: string;
  name: string;
  visibility: 'public' | 'external' | 'internal' | 'private';
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  modifiers: string[];
  securityIssues: SecurityVulnerability[];
  gasComplexity: 'low' | 'medium' | 'high' | 'very_high';
}

interface AccessControlAnalysis {
  hasOwner: boolean;
  ownerCanUpgrade: boolean;
  hasRoleBasedAccess: boolean;
  criticalFunctions: Array<{
    name: string;
    accessRestriction: string;
    issue?: string;
  }>;
  emergencyStopMechanism: boolean;
}

interface EconomicVulnerabilities {
  hasReentrancyRisk: boolean;
  hasIntegerOverflow: boolean;
  hasFlashLoanVulnerability: boolean;
  hasPriceManipulationRisk: boolean;
  hasFrontRunningRisk: boolean;
  details: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
  }>;
}

export class ContractSecurityScanner {
  private readonly CRITICAL_OPCODES = [
    'SELFDESTRUCT',
    'DELEGATECALL',
    'CALLCODE',
  ];

  private readonly DANGEROUS_PATTERNS = [
    'transfer(',
    'send(',
    'call.value',
    'tx.origin',
    'block.timestamp',
    'block.number',
  ];

  /**
   * Comprehensive security audit of smart contract
   */
  async auditContract(contract: ContractCode): Promise<SecurityAuditReport> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // 1. Bytecode analysis
    const bytecodeVulns = this.analyzeBytecode(contract.bytecode);
    vulnerabilities.push(...bytecodeVulns);

    // 2. Source code analysis (if available)
    if (contract.sourceCode) {
      const sourceVulns = this.analyzeSourceCode(contract.sourceCode);
      vulnerabilities.push(...sourceVulns);
    }

    // 3. ABI analysis
    if (contract.abi) {
      const abiVulns = this.analyzeABI(contract.abi);
      vulnerabilities.push(...abiVulns);
    }

    // 4. Known vulnerability patterns
    const knownVulns = this.checkKnownVulnerabilities(contract);
    vulnerabilities.push(...knownVulns);

    // 5. Check security patterns
    const securityPatterns = this.checkSecurityPatterns(contract);

    // 6. Generate recommendations
    const recommendations = this.generateRecommendations(vulnerabilities, securityPatterns);

    // Calculate overall score
    const overallScore = this.calculateSecurityScore(vulnerabilities);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(vulnerabilities, overallScore);

    return {
      contractAddress: contract.address,
      overallScore,
      riskLevel,
      vulnerabilities: vulnerabilities.sort((a, b) => {
        const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      securityPatterns,
      recommendations,
      auditTimestamp: Date.now(),
    };
  }

  /**
   * Analyze bytecode for vulnerabilities
   */
  analyzeBytecode(bytecode: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for critical opcodes
    this.CRITICAL_OPCODES.forEach(opcode => {
      if (this.containsOpcode(bytecode, opcode)) {
        let severity: SecurityVulnerability['severity'] = 'high';
        let exploitability = 60;

        if (opcode === 'SELFDESTRUCT') {
          severity = 'critical';
          exploitability = 80;
          vulnerabilities.push({
            severity,
            category: 'Contract Lifecycle',
            name: 'Self-Destruct Function',
            description: 'Contract contains SELFDESTRUCT opcode which can destroy the contract',
            recommendation: 'Ensure only authorized addresses can trigger self-destruct',
            exploitability,
          });
        }

        if (opcode === 'DELEGATECALL') {
          vulnerabilities.push({
            severity,
            category: 'Proxy Pattern',
            name: 'Delegate Call Usage',
            description: 'DELEGATECALL can be dangerous if not properly secured',
            recommendation: 'Ensure delegate call targets are strictly controlled',
            exploitability,
          });
        }
      }
    });

    // Check for unchecked external calls
    if (this.hasUncheckedExternalCall(bytecode)) {
      vulnerabilities.push({
        severity: 'high',
        category: 'External Calls',
        name: 'Unchecked External Call',
        description: 'Contract makes external calls without checking return values',
        recommendation: 'Always check return values of external calls',
        exploitability: 70,
      });
    }

    // Check for reentrancy patterns
    if (this.hasReentrancyPattern(bytecode)) {
      vulnerabilities.push({
        severity: 'critical',
        category: 'Reentrancy',
        name: 'Potential Reentrancy Vulnerability',
        description: 'Code pattern suggests possible reentrancy attack vector',
        recommendation: 'Implement checks-effects-interactions pattern or use ReentrancyGuard',
        cve: 'SWC-107',
        exploitability: 85,
      });
    }

    return vulnerabilities;
  }

  /**
   * Analyze source code for vulnerabilities
   */
  analyzeSourceCode(sourceCode: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for tx.origin usage
    if (sourceCode.includes('tx.origin')) {
      vulnerabilities.push({
        severity: 'high',
        category: 'Authorization',
        name: 'tx.origin Usage',
        description: 'Using tx.origin for authorization is vulnerable to phishing attacks',
        recommendation: 'Use msg.sender instead of tx.origin',
        cve: 'SWC-115',
        exploitability: 75,
      });
    }

    // Check for block.timestamp manipulation
    if (sourceCode.match(/block\.timestamp|now/)) {
      vulnerabilities.push({
        severity: 'medium',
        category: 'Time Manipulation',
        name: 'Block Timestamp Dependency',
        description: 'Contract logic depends on block.timestamp which miners can manipulate',
        recommendation: 'Avoid using timestamps for critical logic or add safety margins',
        cve: 'SWC-116',
        exploitability: 50,
      });
    }

    // Check for unchecked transfer/send
    if (sourceCode.match(/\.transfer\(|\.send\(/)) {
      const hasCheckedReturn = sourceCode.includes('require(') || sourceCode.includes('if(');
      if (!hasCheckedReturn) {
        vulnerabilities.push({
          severity: 'medium',
          category: 'Fund Transfer',
          name: 'Unchecked Transfer',
          description: 'Transfer or send without checking success',
          recommendation: 'Check return value or use call with value',
          exploitability: 60,
        });
      }
    }

    // Check for integer overflow (pre-Solidity 0.8.0)
    if (!sourceCode.includes('pragma solidity ^0.8') && 
        !sourceCode.includes('SafeMath')) {
      vulnerabilities.push({
        severity: 'high',
        category: 'Arithmetic',
        name: 'Integer Overflow Risk',
        description: 'No SafeMath usage in pre-0.8.0 Solidity version',
        recommendation: 'Use SafeMath library or upgrade to Solidity 0.8.0+',
        cve: 'SWC-101',
        exploitability: 70,
      });
    }

    // Check for uninitialized storage pointers
    if (sourceCode.match(/\s+var\s+/)) {
      vulnerabilities.push({
        severity: 'critical',
        category: 'Storage',
        name: 'Uninitialized Storage Pointer',
        description: 'Using "var" can create uninitialized storage pointers',
        recommendation: 'Always explicitly declare variable types',
        cve: 'SWC-109',
        exploitability: 80,
      });
    }

    // Check for floating pragma
    if (sourceCode.match(/pragma solidity \^/)) {
      vulnerabilities.push({
        severity: 'low',
        category: 'Best Practices',
        name: 'Floating Pragma',
        description: 'Pragma not locked to specific compiler version',
        recommendation: 'Lock pragma to specific compiler version',
        cve: 'SWC-103',
        exploitability: 10,
      });
    }

    // Check for assert usage
    if (sourceCode.includes('assert(')) {
      vulnerabilities.push({
        severity: 'info',
        category: 'Error Handling',
        name: 'Assert Usage',
        description: 'Assert should only be used for internal errors, not for validation',
        recommendation: 'Use require() for validation, assert() for internal invariants',
        exploitability: 20,
      });
    }

    return vulnerabilities;
  }

  /**
   * Analyze access control mechanisms
   */
  analyzeAccessControl(contract: ContractCode): AccessControlAnalysis {
    const sourceCode = contract.sourceCode || '';

    const hasOwner = sourceCode.includes('Ownable') || 
                     sourceCode.includes('owner') ||
                     sourceCode.includes('admin');

    const ownerCanUpgrade = sourceCode.includes('upgradeTo') ||
                           sourceCode.includes('UUPSUpgradeable') ||
                           sourceCode.includes('TransparentUpgradeableProxy');

    const hasRoleBasedAccess = sourceCode.includes('AccessControl') ||
                              sourceCode.includes('hasRole') ||
                              sourceCode.includes('grantRole');

    const emergencyStopMechanism = sourceCode.includes('Pausable') ||
                                  sourceCode.includes('pause()') ||
                                  sourceCode.includes('emergencyStop');

    // Identify critical functions
    const criticalFunctions: AccessControlAnalysis['criticalFunctions'] = [];
    
    const criticalKeywords = ['withdraw', 'mint', 'burn', 'transfer', 'approve', 'pause', 'upgrade'];
    criticalKeywords.forEach(keyword => {
      const regex = new RegExp(`function\\s+(\\w*${keyword}\\w*)`, 'gi');
      const matches = sourceCode.matchAll(regex);
      
      for (const match of matches) {
        const functionName = match[1];
        const hasModifier = /onlyOwner|onlyAdmin|onlyRole/.test(sourceCode.slice(match.index, match.index + 200));
        
        criticalFunctions.push({
          name: functionName,
          accessRestriction: hasModifier ? 'Protected' : 'Unprotected',
          issue: hasModifier ? undefined : 'Missing access control',
        });
      }
    });

    return {
      hasOwner,
      ownerCanUpgrade,
      hasRoleBasedAccess,
      criticalFunctions,
      emergencyStopMechanism,
    };
  }

  /**
   * Detect economic vulnerabilities
   */
  detectEconomicVulnerabilities(contract: ContractCode): EconomicVulnerabilities {
    const sourceCode = contract.sourceCode || '';
    const details: EconomicVulnerabilities['details'] = [];

    // Reentrancy check
    const hasReentrancyRisk = this.hasReentrancyPattern(contract.bytecode) ||
                             (!sourceCode.includes('ReentrancyGuard') && 
                              sourceCode.includes('call{value:'));

    if (hasReentrancyRisk) {
      details.push({
        type: 'Reentrancy',
        severity: 'critical',
        explanation: 'Contract may be vulnerable to reentrancy attacks',
      });
    }

    // Integer overflow (Solidity < 0.8.0)
    const hasIntegerOverflow = !sourceCode.includes('pragma solidity ^0.8') &&
                              !sourceCode.includes('SafeMath');

    if (hasIntegerOverflow) {
      details.push({
        type: 'Integer Overflow',
        severity: 'high',
        explanation: 'Arithmetic operations may overflow without checks',
      });
    }

    // Flash loan vulnerability
    const hasFlashLoanVulnerability = sourceCode.includes('flashLoan') ||
                                     (sourceCode.includes('borrow') && 
                                      sourceCode.includes('repay'));

    if (hasFlashLoanVulnerability) {
      details.push({
        type: 'Flash Loan Attack',
        severity: 'high',
        explanation: 'Contract interacts with flash loans, ensure proper protection',
      });
    }

    // Price manipulation
    const hasPriceManipulationRisk = sourceCode.includes('getAmountsOut') ||
                                    sourceCode.includes('getReserves') ||
                                    (sourceCode.includes('price') && 
                                     !sourceCode.includes('oracle'));

    if (hasPriceManipulationRisk) {
      details.push({
        type: 'Price Manipulation',
        severity: 'high',
        explanation: 'Contract may be vulnerable to price oracle manipulation',
      });
    }

    // Front-running
    const hasFrontRunningRisk = sourceCode.includes('slippage') ||
                               sourceCode.includes('swap') ||
                               sourceCode.includes('deadline');

    if (hasFrontRunningRisk) {
      details.push({
        type: 'Front-Running',
        severity: 'medium',
        explanation: 'Transaction ordering can be exploited by front-runners',
      });
    }

    return {
      hasReentrancyRisk,
      hasIntegerOverflow,
      hasFlashLoanVulnerability,
      hasPriceManipulationRisk,
      hasFrontRunningRisk,
      details,
    };
  }

  /**
   * Analyze gas optimization and DoS risks
   */
  analyzeGasAndDoS(contract: ContractCode): {
    unboundedLoops: string[];
    expensiveOperations: string[];
    dosRisks: Array<{
      location: string;
      risk: string;
      severity: 'high' | 'medium' | 'low';
    }>;
  } {
    const sourceCode = contract.sourceCode || '';
    const unboundedLoops: string[] = [];
    const expensiveOperations: string[] = [];
    const dosRisks: Array<{ location: string; risk: string; severity: 'high' | 'medium' | 'low' }> = [];

    // Check for unbounded loops
    const forLoopMatches = sourceCode.matchAll(/for\s*\([^)]*\.length[^)]*\)/g);
    for (const match of forLoopMatches) {
      unboundedLoops.push(match[0]);
      dosRisks.push({
        location: 'Loop statement',
        risk: 'Unbounded loop can cause out-of-gas',
        severity: 'high',
      });
    }

    // Check for expensive operations in loops
    if (sourceCode.match(/for.*\{[\s\S]*?(SSTORE|SLOAD|delegatecall|call)/)) {
      expensiveOperations.push('Storage operations in loop');
      dosRisks.push({
        location: 'Loop with storage operations',
        risk: 'High gas costs can make function unusable',
        severity: 'medium',
      });
    }

    // Check for external calls in loops
    if (sourceCode.match(/for.*\{[\s\S]*?\.call\(/)) {
      dosRisks.push({
        location: 'External call in loop',
        risk: 'External call failure can DoS entire function',
        severity: 'high',
      });
    }

    return {
      unboundedLoops,
      expensiveOperations,
      dosRisks,
    };
  }

  // Private helper methods
  private containsOpcode(bytecode: string, opcode: string): boolean {
    const opcodeMap: Record<string, string> = {
      'SELFDESTRUCT': 'ff',
      'DELEGATECALL': 'f4',
      'CALLCODE': 'f2',
    };
    
    const opcodeHex = opcodeMap[opcode];
    return opcodeHex ? bytecode.includes(opcodeHex) : false;
  }

  private hasUncheckedExternalCall(bytecode: string): boolean {
    // Simplified check for CALL opcode without ISZERO check
    return bytecode.includes('f1') && !bytecode.includes('15'); // CALL without ISZERO
  }

  private hasReentrancyPattern(bytecode: string): boolean {
    // Simplified pattern: CALL followed by SSTORE
    const callIndex = bytecode.indexOf('f1');
    if (callIndex === -1) return false;
    
    const sstoreIndex = bytecode.indexOf('55', callIndex);
    return sstoreIndex !== -1 && (sstoreIndex - callIndex) < 100;
  }

  private analyzeABI(abi: any[]): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    abi.forEach(item => {
      if (item.type === 'function') {
        // Check for payable functions without proper checks
        if (item.stateMutability === 'payable') {
          vulnerabilities.push({
            severity: 'info',
            category: 'Payable Functions',
            name: `Payable Function: ${item.name}`,
            description: 'Function accepts ETH, ensure proper handling',
            recommendation: 'Verify ETH handling logic and access controls',
            exploitability: 30,
          });
        }

        // Check for external functions without access control
        if (item.visibility === 'external' || item.visibility === 'public') {
          const hasAccessModifier = item.modifiers?.some((m: string) => 
            m.includes('only') || m.includes('require')
          );

          if (!hasAccessModifier && 
              (item.name.includes('withdraw') || 
               item.name.includes('transfer') ||
               item.name.includes('mint'))) {
            vulnerabilities.push({
              severity: 'critical',
              category: 'Access Control',
              name: `Unprotected ${item.name}`,
              description: 'Critical function lacks access control',
              recommendation: 'Add proper access control modifiers',
              exploitability: 90,
            });
          }
        }
      }
    });

    return vulnerabilities;
  }

  private checkKnownVulnerabilities(contract: ContractCode): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const sourceCode = contract.sourceCode || '';

    // Check for known vulnerable patterns from SWC registry
    const knownPatterns = [
      {
        pattern: /ecrecover\(/,
        name: 'Signature Malleability',
        severity: 'medium' as const,
        cve: 'SWC-117',
      },
      {
        pattern: /randomness|random/,
        name: 'Weak Randomness',
        severity: 'high' as const,
        cve: 'SWC-120',
      },
      {
        pattern: /\.call\.value\(\)\(/,
        name: 'Deprecated Call Pattern',
        severity: 'medium' as const,
        cve: 'SWC-134',
      },
    ];

    knownPatterns.forEach(({ pattern, name, severity, cve }) => {
      if (pattern.test(sourceCode)) {
        vulnerabilities.push({
          severity,
          category: 'Known Vulnerability',
          name,
          description: `Contract contains pattern associated with ${cve}`,
          recommendation: `Review and mitigate ${cve}`,
          cve,
          exploitability: 60,
        });
      }
    });

    return vulnerabilities;
  }

  private checkSecurityPatterns(contract: ContractCode): SecurityAuditReport['securityPatterns'] {
    const sourceCode = contract.sourceCode || '';

    return [
      {
        pattern: 'Checks-Effects-Interactions',
        implemented: this.hasChecksEffectsPattern(sourceCode),
        importance: 'critical',
      },
      {
        pattern: 'ReentrancyGuard',
        implemented: sourceCode.includes('ReentrancyGuard') || 
                    sourceCode.includes('nonReentrant'),
        importance: 'high',
      },
      {
        pattern: 'Access Control',
        implemented: sourceCode.includes('Ownable') || 
                    sourceCode.includes('AccessControl'),
        importance: 'critical',
      },
      {
        pattern: 'Pausable',
        implemented: sourceCode.includes('Pausable') || 
                    sourceCode.includes('pause'),
        importance: 'high',
      },
      {
        pattern: 'SafeMath',
        implemented: sourceCode.includes('SafeMath') || 
                    sourceCode.includes('pragma solidity ^0.8'),
        importance: 'high',
      },
      {
        pattern: 'Input Validation',
        implemented: sourceCode.includes('require(') && 
                    sourceCode.match(/require\(/g)!.length > 2,
        importance: 'high',
      },
      {
        pattern: 'Event Emission',
        implemented: sourceCode.includes('emit '),
        importance: 'medium',
      },
      {
        pattern: 'NatSpec Documentation',
        implemented: sourceCode.includes('/**') || sourceCode.includes('///'),
        importance: 'low',
      },
    ];
  }

  private hasChecksEffectsPattern(sourceCode: string): boolean {
    // Simplified check: require statements before state changes
    const functions = sourceCode.match(/function[^{]+\{[^}]+\}/gs) || [];
    
    let hasPattern = false;
    functions.forEach(func => {
      const requireIndex = func.indexOf('require(');
      const stateChangeIndex = Math.min(
        func.indexOf('=') !== -1 ? func.indexOf('=') : Infinity,
        func.indexOf('.call') !== -1 ? func.indexOf('.call') : Infinity
      );
      
      if (requireIndex !== -1 && requireIndex < stateChangeIndex) {
        hasPattern = true;
      }
    });

    return hasPattern;
  }

  private generateRecommendations(
    vulnerabilities: SecurityVulnerability[],
    patterns: SecurityAuditReport['securityPatterns']
  ): string[] {
    const recommendations: string[] = [];

    // Critical vulnerabilities
    const critical = vulnerabilities.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      recommendations.push(`🔴 URGENT: Fix ${critical.length} critical vulnerabilities immediately`);
    }

    // Missing security patterns
    patterns.forEach(pattern => {
      if (!pattern.implemented && pattern.importance === 'critical') {
        recommendations.push(`Implement ${pattern.pattern} pattern`);
      }
    });

    // General recommendations
    recommendations.push('Conduct professional security audit before mainnet deployment');
    recommendations.push('Implement comprehensive test suite with edge cases');
    recommendations.push('Set up monitoring and alerting for suspicious activity');
    recommendations.push('Establish bug bounty program');

    return recommendations;
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    let score = 100;

    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
        case 'info':
          score -= 0.5;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private determineRiskLevel(
    vulnerabilities: SecurityVulnerability[],
    score: number
  ): SecurityAuditReport['riskLevel'] {
    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    
    if (hasCritical || score < 40) return 'critical';
    if (score < 60) return 'high';
    if (score < 75) return 'medium';
    if (score < 90) return 'low';
    return 'very_low';
  }
}

// Export singleton instance
export const contractSecurityScanner = new ContractSecurityScanner();

