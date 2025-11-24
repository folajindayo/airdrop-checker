/**
 * Wallet Clustering Algorithm - Groups wallets by behavior and ownership
 * Uses machine learning techniques to identify sybil attacks and related accounts
 */

interface WalletFeatures {
  address: string;
  transactionCount: number;
  uniqueProtocols: number;
  avgTransactionValue: number;
  avgGasPrice: number;
  firstSeenTimestamp: number;
  lastSeenTimestamp: number;
  daysSinceFirstActivity: number;
  transactionFrequency: number; // tx per day
  gasSpent: number;
  preferredHours: number[]; // 0-23
  preferredDays: number[]; // 0-6
  protocolDistribution: Map<string, number>;
  tokenDistribution: Map<string, number>;
  interactedAddresses: Set<string>;
}

interface Cluster {
  id: string;
  wallets: string[];
  centroid: number[]; // Feature vector centroid
  size: number;
  cohesion: number; // 0-1, how similar wallets are
  characteristics: {
    avgTransactionValue: number;
    commonProtocols: string[];
    behaviorPattern: string;
    likelyHuman: boolean;
    suspicionScore: number;
  };
}

interface SybilAnalysis {
  isSybil: boolean;
  confidence: number;
  relatedWallets: string[];
  evidence: string[];
  riskScore: number;
  pattern: 'airdrop_farming' | 'money_laundering' | 'wash_trading' | 'bot_network' | 'legitimate';
}

interface NetworkGraph {
  nodes: Array<{
    address: string;
    label: string;
    importance: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    weight: number; // transaction frequency
    value: number; // total value transferred
  }>;
  communities: Array<{
    id: string;
    members: string[];
    density: number;
  }>;
}

export class WalletClusteringAlgorithm {
  private readonly MIN_SIMILARITY_THRESHOLD = 0.7;
  private readonly SYBIL_SIMILARITY_THRESHOLD = 0.85;
  private readonly MAX_CLUSTERS = 50;

  /**
   * Extract features from wallet transactions
   */
  extractFeatures(
    address: string,
    transactions: Array<{
      timestamp: number;
      value: number;
      gasPrice: number;
      to: string;
      from: string;
      protocol?: string;
      token?: string;
    }>
  ): WalletFeatures {
    const txCount = transactions.length;
    const protocols = new Set(transactions.map(tx => tx.protocol).filter(Boolean));
    
    const avgValue = transactions.reduce((sum, tx) => sum + tx.value, 0) / txCount;
    const avgGas = transactions.reduce((sum, tx) => sum + tx.gasPrice, 0) / txCount;
    
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const firstSeen = sorted[0].timestamp;
    const lastSeen = sorted[sorted.length - 1].timestamp;
    const daysSinceFirst = (Date.now() - firstSeen) / (24 * 3600 * 1000);
    const txFrequency = txCount / Math.max(daysSinceFirst, 1);
    
    const gasSpent = transactions.reduce(
      (sum, tx) => sum + (tx.gasPrice * 21000), // Simplified
      0
    );

    // Extract temporal patterns
    const hours = transactions.map(tx => new Date(tx.timestamp).getHours());
    const days = transactions.map(tx => new Date(tx.timestamp).getDay());
    
    const preferredHours = this.findModes(hours, 3);
    const preferredDays = this.findModes(days, 2);

    // Protocol distribution
    const protocolDist = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.protocol) {
        protocolDist.set(tx.protocol, (protocolDist.get(tx.protocol) || 0) + 1);
      }
    });

    // Token distribution
    const tokenDist = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.token) {
        tokenDist.set(tx.token, (tokenDist.get(tx.token) || 0) + 1);
      }
    });

    // Interacted addresses
    const interacted = new Set<string>();
    transactions.forEach(tx => {
      if (tx.from === address) interacted.add(tx.to);
      else interacted.add(tx.from);
    });

    return {
      address,
      transactionCount: txCount,
      uniqueProtocols: protocols.size,
      avgTransactionValue: avgValue,
      avgGasPrice: avgGas,
      firstSeenTimestamp: firstSeen,
      lastSeenTimestamp: lastSeen,
      daysSinceFirstActivity: daysSinceFirst,
      transactionFrequency: txFrequency,
      gasSpent,
      preferredHours,
      preferredDays,
      protocolDistribution: protocolDist,
      tokenDistribution: tokenDist,
      interactedAddresses: interacted,
    };
  }

  /**
   * Cluster wallets using K-means algorithm
   */
  clusterWallets(
    walletFeatures: WalletFeatures[],
    numClusters?: number
  ): Cluster[] {
    if (walletFeatures.length < 2) {
      return [];
    }

    // Determine optimal number of clusters if not specified
    const k = numClusters || this.determineOptimalClusters(walletFeatures);

    // Convert features to vectors
    const vectors = walletFeatures.map(wf => this.featuresToVector(wf));

    // Normalize vectors
    const normalized = this.normalizeVectors(vectors);

    // Initialize centroids randomly
    let centroids = this.initializeCentroids(normalized, k);

    // K-means iterations
    let assignments: number[] = [];
    let converged = false;
    let iterations = 0;
    const maxIterations = 100;

    while (!converged && iterations < maxIterations) {
      // Assign points to nearest centroid
      const newAssignments = normalized.map(vector =>
        this.findNearestCentroid(vector, centroids)
      );

      // Check convergence
      converged = this.arraysEqual(assignments, newAssignments);
      assignments = newAssignments;

      // Update centroids
      centroids = this.updateCentroids(normalized, assignments, k);

      iterations++;
    }

    // Build clusters
    const clusters: Cluster[] = [];
    for (let i = 0; i < k; i++) {
      const clusterWallets = walletFeatures.filter((_, idx) => assignments[idx] === i);
      
      if (clusterWallets.length === 0) continue;

      const cohesion = this.calculateCohesion(
        clusterWallets.map(wf => this.featuresToVector(wf)),
        centroids[i]
      );

      clusters.push({
        id: `cluster-${i}`,
        wallets: clusterWallets.map(wf => wf.address),
        centroid: centroids[i],
        size: clusterWallets.length,
        cohesion,
        characteristics: this.analyzeClusterCharacteristics(clusterWallets),
      });
    }

    return clusters.sort((a, b) => b.size - a.size);
  }

  /**
   * Detect sybil attacks (multiple wallets controlled by one entity)
   */
  detectSybilAttack(
    targetWallet: string,
    allWallets: WalletFeatures[]
  ): SybilAnalysis {
    const target = allWallets.find(w => w.address === targetWallet);
    if (!target) {
      return {
        isSybil: false,
        confidence: 0,
        relatedWallets: [],
        evidence: [],
        riskScore: 0,
        pattern: 'legitimate',
      };
    }

    const relatedWallets: string[] = [];
    const evidence: string[] = [];
    let suspicionScore = 0;

    // Check similarity with other wallets
    allWallets.forEach(wallet => {
      if (wallet.address === targetWallet) return;

      const similarity = this.calculateSimilarity(target, wallet);

      if (similarity > this.SYBIL_SIMILARITY_THRESHOLD) {
        relatedWallets.push(wallet.address);
        suspicionScore += 20;

        // Collect evidence
        if (this.hasTemporalCorrelation(target, wallet)) {
          evidence.push(`Similar activity timing with ${wallet.address.slice(0, 10)}...`);
          suspicionScore += 10;
        }

        if (this.hasCommonInteractions(target, wallet)) {
          evidence.push(`Common transaction partners with ${wallet.address.slice(0, 10)}...`);
          suspicionScore += 15;
        }

        if (this.hasSimilarFunding(target, wallet)) {
          evidence.push(`Similar funding pattern with ${wallet.address.slice(0, 10)}...`);
          suspicionScore += 20;
        }
      }
    });

    // Determine pattern
    let pattern: SybilAnalysis['pattern'] = 'legitimate';
    if (suspicionScore > 80) {
      pattern = this.identifySybilPattern(target, relatedWallets);
    }

    const isSybil = suspicionScore > 60;
    const confidence = Math.min(suspicionScore, 100);

    return {
      isSybil,
      confidence,
      relatedWallets: relatedWallets.slice(0, 10), // Top 10
      evidence,
      riskScore: suspicionScore,
      pattern,
    };
  }

  /**
   * Build network graph of wallet interactions
   */
  buildNetworkGraph(
    wallets: WalletFeatures[],
    minInteractions: number = 2
  ): NetworkGraph {
    const nodes = wallets.map(wallet => ({
      address: wallet.address,
      label: wallet.address.slice(0, 10) + '...',
      importance: this.calculateNodeImportance(wallet),
    }));

    const edges: NetworkGraph['edges'] = [];
    const interactionMatrix = new Map<string, Map<string, { count: number; value: number }>>();

    // Build interaction matrix
    wallets.forEach(wallet => {
      wallet.interactedAddresses.forEach(target => {
        const key = `${wallet.address}-${target}`;
        if (!interactionMatrix.has(wallet.address)) {
          interactionMatrix.set(wallet.address, new Map());
        }
        const current = interactionMatrix.get(wallet.address)!.get(target) || { count: 0, value: 0 };
        interactionMatrix.get(wallet.address)!.set(target, {
          count: current.count + 1,
          value: current.value + wallet.avgTransactionValue,
        });
      });
    });

    // Create edges
    interactionMatrix.forEach((targets, from) => {
      targets.forEach((data, to) => {
        if (data.count >= minInteractions) {
          edges.push({
            from,
            to,
            weight: data.count,
            value: data.value,
          });
        }
      });
    });

    // Detect communities using simple modularity
    const communities = this.detectCommunities(nodes.map(n => n.address), edges);

    return { nodes, edges, communities };
  }

  /**
   * Calculate similarity between two wallets
   */
  calculateSimilarity(wallet1: WalletFeatures, wallet2: WalletFeatures): number {
    const v1 = this.featuresToVector(wallet1);
    const v2 = this.featuresToVector(wallet2);

    return this.cosineSimilarity(v1, v2);
  }

  /**
   * Identify wallet behavior patterns
   */
  identifyBehaviorPattern(wallet: WalletFeatures): {
    pattern: 'farmer' | 'trader' | 'holder' | 'bot' | 'whale' | 'new_user';
    confidence: number;
    characteristics: string[];
  } {
    const characteristics: string[] = [];
    let pattern: 'farmer' | 'trader' | 'holder' | 'bot' | 'whale' | 'new_user' = 'new_user';
    let confidence = 50;

    // Airdrop farmer detection
    if (wallet.uniqueProtocols > 15 && 
        wallet.avgTransactionValue < 500 &&
        wallet.transactionFrequency > 1) {
      pattern = 'farmer';
      confidence = 80;
      characteristics.push('High protocol diversity');
      characteristics.push('Small transaction sizes');
      characteristics.push('High activity frequency');
    }

    // Trader detection
    else if (wallet.transactionFrequency > 5 &&
             wallet.avgTransactionValue > 1000) {
      pattern = 'trader';
      confidence = 75;
      characteristics.push('Very high activity');
      characteristics.push('Significant transaction values');
    }

    // Bot detection
    else if (this.hasRegularTimingPattern(wallet)) {
      pattern = 'bot';
      confidence = 85;
      characteristics.push('Regular timing pattern');
      characteristics.push('Automated behavior');
    }

    // Whale detection
    else if (wallet.avgTransactionValue > 100000) {
      pattern = 'whale';
      confidence = 90;
      characteristics.push('Very large transaction values');
      characteristics.push('Significant capital');
    }

    // Holder detection
    else if (wallet.transactionFrequency < 0.1 &&
             wallet.daysSinceFirstActivity > 365) {
      pattern = 'holder';
      confidence = 70;
      characteristics.push('Low activity frequency');
      characteristics.push('Long-term holder');
    }

    // New user
    else if (wallet.daysSinceFirstActivity < 30) {
      pattern = 'new_user';
      confidence = 80;
      characteristics.push('Recent account');
    }

    return { pattern, confidence, characteristics };
  }

  // Private helper methods
  private featuresToVector(features: WalletFeatures): number[] {
    return [
      features.transactionCount,
      features.uniqueProtocols,
      features.avgTransactionValue,
      features.avgGasPrice,
      features.transactionFrequency,
      features.gasSpent,
      features.daysSinceFirstActivity,
      features.preferredHours.length,
      features.preferredDays.length,
    ];
  }

  private normalizeVectors(vectors: number[][]): number[][] {
    const dimensions = vectors[0].length;
    const mins = new Array(dimensions).fill(Infinity);
    const maxs = new Array(dimensions).fill(-Infinity);

    // Find min and max for each dimension
    vectors.forEach(vector => {
      vector.forEach((val, idx) => {
        mins[idx] = Math.min(mins[idx], val);
        maxs[idx] = Math.max(maxs[idx], val);
      });
    });

    // Normalize
    return vectors.map(vector =>
      vector.map((val, idx) => {
        const range = maxs[idx] - mins[idx];
        return range === 0 ? 0 : (val - mins[idx]) / range;
      })
    );
  }

  private initializeCentroids(vectors: number[][], k: number): number[][] {
    // K-means++ initialization
    const centroids: number[][] = [];
    
    // First centroid: random point
    centroids.push([...vectors[Math.floor(Math.random() * vectors.length)]]);

    // Remaining centroids: choose points far from existing centroids
    while (centroids.length < k) {
      const distances = vectors.map(v => {
        const minDist = Math.min(...centroids.map(c => this.euclideanDistance(v, c)));
        return minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      const probabilities = distances.map(d => d / sum);

      // Weighted random selection
      const rand = Math.random();
      let cumSum = 0;
      for (let i = 0; i < probabilities.length; i++) {
        cumSum += probabilities[i];
        if (rand <= cumSum) {
          centroids.push([...vectors[i]]);
          break;
        }
      }
    }

    return centroids;
  }

  private findNearestCentroid(vector: number[], centroids: number[][]): number {
    let minDist = Infinity;
    let nearest = 0;

    centroids.forEach((centroid, idx) => {
      const dist = this.euclideanDistance(vector, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });

    return nearest;
  }

  private updateCentroids(
    vectors: number[][],
    assignments: number[],
    k: number
  ): number[][] {
    const centroids: number[][] = [];

    for (let i = 0; i < k; i++) {
      const clusterPoints = vectors.filter((_, idx) => assignments[idx] === i);
      
      if (clusterPoints.length === 0) {
        // Keep old centroid if cluster is empty
        centroids.push(new Array(vectors[0].length).fill(0));
        continue;
      }

      const dimensions = clusterPoints[0].length;
      const centroid = new Array(dimensions).fill(0);

      clusterPoints.forEach(point => {
        point.forEach((val, idx) => {
          centroid[idx] += val;
        });
      });

      centroids.push(centroid.map(sum => sum / clusterPoints.length));
    }

    return centroids;
  }

  private euclideanDistance(v1: number[], v2: number[]): number {
    return Math.sqrt(
      v1.reduce((sum, val, idx) => sum + Math.pow(val - v2[idx], 2), 0)
    );
  }

  private cosineSimilarity(v1: number[], v2: number[]): number {
    const dotProduct = v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));

    return mag1 * mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
  }

  private calculateCohesion(vectors: number[][], centroid: number[]): number {
    if (vectors.length === 0) return 0;

    const avgDistance = vectors.reduce(
      (sum, v) => sum + this.euclideanDistance(v, centroid),
      0
    ) / vectors.length;

    // Convert distance to cohesion (0-1 scale, higher = more cohesive)
    return Math.max(0, 1 - avgDistance);
  }

  private analyzeClusterCharacteristics(wallets: WalletFeatures[]): Cluster['characteristics'] {
    const avgValue = wallets.reduce((sum, w) => sum + w.avgTransactionValue, 0) / wallets.length;
    
    const allProtocols = new Map<string, number>();
    wallets.forEach(w => {
      w.protocolDistribution.forEach((count, protocol) => {
        allProtocols.set(protocol, (allProtocols.get(protocol) || 0) + count);
      });
    });

    const commonProtocols = Array.from(allProtocols.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([protocol]) => protocol);

    // Determine behavior pattern
    const avgFrequency = wallets.reduce((sum, w) => sum + w.transactionFrequency, 0) / wallets.length;
    let behaviorPattern = '';
    if (avgFrequency > 5) behaviorPattern = 'Very active traders';
    else if (avgFrequency > 1) behaviorPattern = 'Regular users';
    else behaviorPattern = 'Occasional users';

    // Check if likely human
    const hasVariedTiming = wallets.some(w => w.preferredHours.length > 3);
    const likelyHuman = hasVariedTiming && avgFrequency < 10;

    // Calculate suspicion score
    let suspicionScore = 0;
    if (!likelyHuman) suspicionScore += 30;
    if (wallets.length > 10 && this.haveSimilarFunding(wallets)) suspicionScore += 40;

    return {
      avgTransactionValue: avgValue,
      commonProtocols,
      behaviorPattern,
      likelyHuman,
      suspicionScore,
    };
  }

  private determineOptimalClusters(walletFeatures: WalletFeatures[]): number {
    // Use elbow method (simplified)
    const n = walletFeatures.length;
    return Math.min(Math.ceil(Math.sqrt(n / 2)), this.MAX_CLUSTERS);
  }

  private arraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, idx) => val === arr2[idx]);
  }

  private findModes(arr: number[], topN: number): number[] {
    const counts = new Map<number, number>();
    arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([val]) => val);
  }

  private hasTemporalCorrelation(w1: WalletFeatures, w2: WalletFeatures): boolean {
    const hourOverlap = w1.preferredHours.filter(h => w2.preferredHours.includes(h)).length;
    return hourOverlap >= 2;
  }

  private hasCommonInteractions(w1: WalletFeatures, w2: WalletFeatures): boolean {
    const common = [...w1.interactedAddresses].filter(a => w2.interactedAddresses.has(a));
    return common.length >= 3;
  }

  private hasSimilarFunding(w1: WalletFeatures, w2: WalletFeatures): boolean {
    // Simplified: check if wallets have similar patterns
    return Math.abs(w1.avgTransactionValue - w2.avgTransactionValue) < w1.avgTransactionValue * 0.1;
  }

  private haveSimilarFunding(wallets: WalletFeatures[]): boolean {
    if (wallets.length < 2) return false;
    const avgValues = wallets.map(w => w.avgTransactionValue);
    const mean = avgValues.reduce((sum, v) => sum + v, 0) / avgValues.length;
    const variance = avgValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / avgValues.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    return coefficientOfVariation < 0.2; // Low variation
  }

  private identifySybilPattern(
    target: WalletFeatures,
    related: string[]
  ): SybilAnalysis['pattern'] {
    if (target.uniqueProtocols > 10 && related.length > 5) {
      return 'airdrop_farming';
    }
    if (target.transactionFrequency > 10) {
      return 'bot_network';
    }
    return 'wash_trading';
  }

  private hasRegularTimingPattern(wallet: WalletFeatures): boolean {
    return wallet.preferredHours.length <= 2 && wallet.transactionFrequency > 5;
  }

  private calculateNodeImportance(wallet: WalletFeatures): number {
    // PageRank-like importance
    return Math.log(wallet.transactionCount + 1) * 
           Math.log(wallet.interactedAddresses.size + 1);
  }

  private detectCommunities(
    nodes: string[],
    edges: NetworkGraph['edges']
  ): NetworkGraph['communities'] {
    // Simplified community detection using connected components
    const adjacency = new Map<string, Set<string>>();
    
    edges.forEach(edge => {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, new Set());
      adjacency.get(edge.from)!.add(edge.to);
      adjacency.get(edge.to)!.add(edge.from);
    });

    const visited = new Set<string>();
    const communities: NetworkGraph['communities'] = [];

    const dfs = (node: string, community: string[]) => {
      visited.add(node);
      community.push(node);
      
      adjacency.get(node)?.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, community);
        }
      });
    };

    nodes.forEach(node => {
      if (!visited.has(node)) {
        const community: string[] = [];
        dfs(node, community);
        
        if (community.length > 1) {
          const density = this.calculateCommunityDensity(community, edges);
          communities.push({
            id: `community-${communities.length}`,
            members: community,
            density,
          });
        }
      }
    });

    return communities;
  }

  private calculateCommunityDensity(
    members: string[],
    edges: NetworkGraph['edges']
  ): number {
    const memberSet = new Set(members);
    const internalEdges = edges.filter(
      e => memberSet.has(e.from) && memberSet.has(e.to)
    ).length;
    
    const maxPossibleEdges = (members.length * (members.length - 1)) / 2;
    return maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;
  }
}

// Export singleton instance
export const walletClusteringAlgorithm = new WalletClusteringAlgorithm();

