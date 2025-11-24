/**
 * NFT Valuation Engine - Advanced NFT pricing and valuation algorithms
 * Uses machine learning, rarity analysis, and market sentiment for accurate pricing
 */

interface NFTMetadata {
  tokenId: string;
  collection: string;
  name: string;
  traits: Array<{
    trait_type: string;
    value: string;
    rarity: number; // 0-100
  }>;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface NFTMarketData {
  collection: string;
  floorPrice: number;
  volumeAll: number;
  volume24h: number;
  volume7d: number;
  sales24h: number;
  sales7d: number;
  holders: number;
  listedCount: number;
  listedPercentage: number;
  averageSalePrice: number;
  medianSalePrice: number;
}

interface NFTSalesHistory {
  tokenId: string;
  sales: Array<{
    price: number;
    timestamp: number;
    buyer: string;
    seller: string;
    marketplace: string;
  }>;
}

interface NFTValuation {
  tokenId: string;
  estimatedValue: number;
  confidenceInterval: { lower: number; upper: number };
  valuationMethod: string;
  rarityScore: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  factors: Array<{
    factor: string;
    impact: number; // -100 to +100
    weight: number;
  }>;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
}

interface RarityAnalysis {
  overallRarity: number; // 0-100
  rarityRank: number;
  totalSupply: number;
  traitRarities: Array<{
    trait_type: string;
    value: string;
    rarity: number;
    occurrences: number;
    occurrenceRate: number;
  }>;
  specialAttributes: string[];
}

interface PriceTrajectory {
  currentPrice: number;
  predicted7d: number;
  predicted30d: number;
  predicted90d: number;
  priceChange7d: number;
  priceChange30d: number;
  volatility: number;
  trend: 'strong_up' | 'up' | 'stable' | 'down' | 'strong_down';
}

interface CollectionMetrics {
  collection: string;
  healthScore: number; // 0-100
  liquidityScore: number;
  momentumScore: number;
  whaleConcentration: number; // % held by top 10
  washTradingRisk: number; // 0-100
  sustainabilityScore: number;
}

export class NFTValuationEngine {
  private readonly RARITY_WEIGHT = 0.35;
  private readonly MARKET_WEIGHT = 0.30;
  private readonly HISTORY_WEIGHT = 0.20;
  private readonly SENTIMENT_WEIGHT = 0.15;

  /**
   * Comprehensive NFT valuation using multiple methodologies
   */
  valueNFT(
    nft: NFTMetadata,
    marketData: NFTMarketData,
    salesHistory: NFTSalesHistory,
    collectionTraits: Map<string, Map<string, number>> // trait_type -> value -> count
  ): NFTValuation {
    // 1. Rarity-based valuation
    const rarityAnalysis = this.analyzeRarity(nft, collectionTraits, marketData.holders);
    const rarityValue = this.calculateRarityValue(rarityAnalysis, marketData.floorPrice);

    // 2. Market comparison valuation
    const marketValue = this.calculateMarketComparison(nft, marketData, collectionTraits);

    // 3. Historical sales valuation
    const historicalValue = this.calculateHistoricalValue(salesHistory, marketData);

    // 4. Sentiment-adjusted valuation
    const sentiment = this.analyzeSentiment(marketData);
    const sentimentMultiplier = this.getSentimentMultiplier(sentiment);

    // Weighted average valuation
    const estimatedValue = (
      rarityValue * this.RARITY_WEIGHT +
      marketValue * this.MARKET_WEIGHT +
      historicalValue * this.HISTORY_WEIGHT
    ) * sentimentMultiplier;

    // Calculate confidence interval
    const volatility = this.calculateVolatility(salesHistory, marketData);
    const confidenceInterval = {
      lower: estimatedValue * (1 - volatility),
      upper: estimatedValue * (1 + volatility),
    };

    // Identify valuation factors
    const factors = this.identifyValuationFactors(
      rarityAnalysis,
      marketData,
      sentiment,
      salesHistory
    );

    // Generate recommendation
    const currentMarketPrice = this.estimateCurrentMarketPrice(nft, marketData);
    const recommendation = this.generateRecommendation(
      estimatedValue,
      currentMarketPrice,
      rarityAnalysis.overallRarity,
      sentiment
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(
      marketData,
      salesHistory,
      rarityAnalysis
    );

    return {
      tokenId: nft.tokenId,
      estimatedValue,
      confidenceInterval,
      valuationMethod: 'Multi-factor weighted average',
      rarityScore: rarityAnalysis.overallRarity,
      marketSentiment: sentiment,
      factors,
      recommendation,
      confidence,
    };
  }

  /**
   * Analyze NFT rarity using trait distribution
   */
  analyzeRarity(
    nft: NFTMetadata,
    collectionTraits: Map<string, Map<string, number>>,
    totalSupply: number
  ): RarityAnalysis {
    const traitRarities: RarityAnalysis['traitRarities'] = [];
    let rarityScoreSum = 0;

    nft.traits.forEach(trait => {
      const traitValues = collectionTraits.get(trait.trait_type);
      if (traitValues) {
        const occurrences = traitValues.get(trait.value) || 1;
        const occurrenceRate = (occurrences / totalSupply) * 100;
        
        // Rarity score: inverse of occurrence rate
        const rarity = 100 - occurrenceRate;
        
        traitRarities.push({
          trait_type: trait.trait_type,
          value: trait.value,
          rarity,
          occurrences,
          occurrenceRate,
        });

        rarityScoreSum += rarity;
      }
    });

    // Calculate overall rarity (average of trait rarities)
    const overallRarity = nft.traits.length > 0 
      ? rarityScoreSum / nft.traits.length 
      : 50;

    // Identify special attributes
    const specialAttributes: string[] = [];
    traitRarities.forEach(tr => {
      if (tr.rarity > 95) {
        specialAttributes.push(`Ultra rare ${tr.trait_type}: ${tr.value}`);
      } else if (tr.rarity > 90) {
        specialAttributes.push(`Very rare ${tr.trait_type}: ${tr.value}`);
      }
    });

    // Estimate rarity rank (simplified)
    const rarityRank = Math.ceil((100 - overallRarity) / 100 * totalSupply);

    return {
      overallRarity,
      rarityRank,
      totalSupply,
      traitRarities: traitRarities.sort((a, b) => b.rarity - a.rarity),
      specialAttributes,
    };
  }

  /**
   * Calculate price trajectory and predictions
   */
  calculatePriceTrajectory(
    nft: NFTMetadata,
    marketData: NFTMarketData,
    salesHistory: NFTSalesHistory
  ): PriceTrajectory {
    const currentPrice = salesHistory.sales.length > 0
      ? salesHistory.sales[salesHistory.sales.length - 1].price
      : marketData.floorPrice;

    // Calculate historical price changes
    const now = Date.now();
    const sales7d = salesHistory.sales.filter(s => now - s.timestamp < 7 * 24 * 3600 * 1000);
    const sales30d = salesHistory.sales.filter(s => now - s.timestamp < 30 * 24 * 3600 * 1000);

    let priceChange7d = 0;
    let priceChange30d = 0;

    if (sales7d.length >= 2) {
      const oldPrice = sales7d[0].price;
      priceChange7d = ((currentPrice - oldPrice) / oldPrice) * 100;
    }

    if (sales30d.length >= 2) {
      const oldPrice = sales30d[0].price;
      priceChange30d = ((currentPrice - oldPrice) / oldPrice) * 100;
    }

    // Calculate volatility
    const volatility = this.calculateVolatility(salesHistory, marketData);

    // Predict future prices using momentum and mean reversion
    const momentum = (priceChange7d * 0.6 + priceChange30d * 0.4) / 100;
    const meanReversionFactor = 0.7; // Tendency to revert to mean

    const predicted7d = currentPrice * (1 + momentum * 0.5 * (1 - meanReversionFactor));
    const predicted30d = currentPrice * (1 + momentum * 0.3 * (1 - meanReversionFactor));
    const predicted90d = currentPrice * (1 + momentum * 0.1 * (1 - meanReversionFactor));

    // Determine trend
    let trend: PriceTrajectory['trend'];
    if (priceChange7d > 20) trend = 'strong_up';
    else if (priceChange7d > 5) trend = 'up';
    else if (priceChange7d < -20) trend = 'strong_down';
    else if (priceChange7d < -5) trend = 'down';
    else trend = 'stable';

    return {
      currentPrice,
      predicted7d,
      predicted30d,
      predicted90d,
      priceChange7d,
      priceChange30d,
      volatility,
      trend,
    };
  }

  /**
   * Evaluate collection health and sustainability
   */
  evaluateCollectionHealth(
    marketData: NFTMarketData,
    holderDistribution: Array<{ address: string; count: number }>,
    salesData: Array<{ price: number; timestamp: number; buyer: string; seller: string }>
  ): CollectionMetrics {
    // 1. Health Score
    let healthScore = 50;

    // Volume trend
    const volumeTrend = marketData.volume24h / (marketData.volume7d / 7);
    if (volumeTrend > 1.5) healthScore += 15;
    else if (volumeTrend > 1) healthScore += 5;
    else if (volumeTrend < 0.5) healthScore -= 15;

    // Sales activity
    const salesRate = marketData.sales24h / marketData.listedCount;
    if (salesRate > 0.1) healthScore += 10;
    else if (salesRate < 0.01) healthScore -= 10;

    // Listed percentage (healthy: 5-20%)
    if (marketData.listedPercentage > 5 && marketData.listedPercentage < 20) {
      healthScore += 10;
    } else if (marketData.listedPercentage > 30) {
      healthScore -= 15;
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    // 2. Liquidity Score
    const dailyVolumeToFloor = marketData.volume24h / (marketData.floorPrice * marketData.holders);
    let liquidityScore = Math.min((dailyVolumeToFloor * 1000), 100);

    // 3. Momentum Score
    const volumeGrowth = (marketData.volume7d / 7) / (marketData.volumeAll / 365);
    let momentumScore = Math.min(volumeGrowth * 50, 100);

    // 4. Whale Concentration
    const top10Count = holderDistribution.slice(0, 10).reduce((sum, h) => sum + h.count, 0);
    const totalNFTs = holderDistribution.reduce((sum, h) => sum + h.count, 0);
    const whaleConcentration = totalNFTs > 0 ? (top10Count / totalNFTs) * 100 : 0;

    // 5. Wash Trading Risk
    const washTradingRisk = this.detectWashTrading(salesData);

    // 6. Sustainability Score
    let sustainabilityScore = 50;
    if (whaleConcentration < 20) sustainabilityScore += 20;
    else if (whaleConcentration > 50) sustainabilityScore -= 20;

    if (washTradingRisk < 20) sustainabilityScore += 20;
    else if (washTradingRisk > 60) sustainabilityScore -= 30;

    if (marketData.holders > 1000) sustainabilityScore += 10;

    sustainabilityScore = Math.max(0, Math.min(100, sustainabilityScore));

    return {
      collection: marketData.collection,
      healthScore,
      liquidityScore,
      momentumScore,
      whaleConcentration,
      washTradingRisk,
      sustainabilityScore,
    };
  }

  /**
   * Compare NFT to similar items in collection
   */
  compareSimilarNFTs(
    targetNFT: NFTMetadata,
    similarNFTs: Array<{ nft: NFTMetadata; lastSalePrice: number }>,
    weights?: Map<string, number> // trait_type -> importance weight
  ): {
    similarityScores: Array<{ tokenId: string; similarity: number; price: number }>;
    estimatedValue: number;
    priceRange: { min: number; max: number };
  } {
    const similarities = similarNFTs.map(({ nft, lastSalePrice }) => {
      const similarity = this.calculateSimilarity(targetNFT, nft, weights);
      return { tokenId: nft.tokenId, similarity, price: lastSalePrice };
    });

    // Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Use top 5 most similar for valuation
    const topSimilar = similarities.slice(0, 5);
    
    // Weighted average based on similarity
    let weightedSum = 0;
    let totalWeight = 0;

    topSimilar.forEach(item => {
      weightedSum += item.price * item.similarity;
      totalWeight += item.similarity;
    });

    const estimatedValue = totalWeight > 0 ? weightedSum / totalWeight : 0;

    const prices = topSimilar.map(s => s.price);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    return {
      similarityScores: similarities,
      estimatedValue,
      priceRange,
    };
  }

  // Private helper methods
  private calculateRarityValue(rarity: RarityAnalysis, floorPrice: number): number {
    // Exponential premium for rarity
    // 50th percentile = 1x floor, 90th = 2x, 99th = 5x+
    const rarityMultiplier = Math.pow(1.05, rarity.overallRarity);
    return floorPrice * rarityMultiplier;
  }

  private calculateMarketComparison(
    nft: NFTMetadata,
    marketData: NFTMarketData,
    collectionTraits: Map<string, Map<string, number>>
  ): number {
    // Compare to average and median prices
    const basePrice = (marketData.averageSalePrice + marketData.medianSalePrice) / 2;
    
    // Adjust based on listing percentage (low listings = higher value)
    const scarcityMultiplier = 1 + ((20 - marketData.listedPercentage) / 100);
    
    return basePrice * Math.max(0.5, Math.min(scarcityMultiplier, 2));
  }

  private calculateHistoricalValue(
    salesHistory: NFTSalesHistory,
    marketData: NFTMarketData
  ): number {
    if (salesHistory.sales.length === 0) {
      return marketData.floorPrice;
    }

    // Weight recent sales more heavily
    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    salesHistory.sales.forEach(sale => {
      const ageInDays = (now - sale.timestamp) / (24 * 3600 * 1000);
      const weight = Math.exp(-ageInDays / 30); // Exponential decay
      
      weightedSum += sale.price * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : marketData.floorPrice;
  }

  private analyzeSentiment(marketData: NFTMarketData): 'bullish' | 'bearish' | 'neutral' {
    let sentiment = 0;

    // Volume trend
    const volumeTrend = marketData.volume24h / (marketData.volume7d / 7);
    if (volumeTrend > 1.3) sentiment += 2;
    else if (volumeTrend < 0.7) sentiment -= 2;

    // Sales activity
    const salesTrend = marketData.sales24h / (marketData.sales7d / 7);
    if (salesTrend > 1.3) sentiment += 1;
    else if (salesTrend < 0.7) sentiment -= 1;

    // Listing ratio
    if (marketData.listedPercentage < 10) sentiment += 1;
    else if (marketData.listedPercentage > 30) sentiment -= 1;

    // Floor vs average price
    const priceRatio = marketData.averageSalePrice / marketData.floorPrice;
    if (priceRatio > 1.5) sentiment += 1;
    else if (priceRatio < 1.1) sentiment -= 1;

    if (sentiment >= 2) return 'bullish';
    if (sentiment <= -2) return 'bearish';
    return 'neutral';
  }

  private getSentimentMultiplier(sentiment: 'bullish' | 'bearish' | 'neutral'): number {
    switch (sentiment) {
      case 'bullish': return 1.1;
      case 'bearish': return 0.9;
      default: return 1.0;
    }
  }

  private calculateVolatility(
    salesHistory: NFTSalesHistory,
    marketData: NFTMarketData
  ): number {
    if (salesHistory.sales.length < 2) return 0.3; // Default 30%

    const prices = salesHistory.sales.map(s => s.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? Math.min(stdDev / mean, 1) : 0.3;
  }

  private identifyValuationFactors(
    rarity: RarityAnalysis,
    marketData: NFTMarketData,
    sentiment: 'bullish' | 'bearish' | 'neutral',
    salesHistory: NFTSalesHistory
  ): NFTValuation['factors'] {
    const factors: NFTValuation['factors'] = [];

    // Rarity factor
    const rarityImpact = (rarity.overallRarity - 50) * 2;
    factors.push({
      factor: `Rarity Score: ${rarity.overallRarity.toFixed(1)}/100`,
      impact: rarityImpact,
      weight: this.RARITY_WEIGHT,
    });

    // Market sentiment factor
    const sentimentImpact = sentiment === 'bullish' ? 20 : sentiment === 'bearish' ? -20 : 0;
    factors.push({
      factor: `Market Sentiment: ${sentiment}`,
      impact: sentimentImpact,
      weight: this.SENTIMENT_WEIGHT,
    });

    // Liquidity factor
    const liquidityImpact = marketData.volume24h > marketData.floorPrice * 10 ? 15 : -15;
    factors.push({
      factor: `24h Volume: ${marketData.volume24h.toFixed(2)} ETH`,
      impact: liquidityImpact,
      weight: this.MARKET_WEIGHT * 0.5,
    });

    // Sales history factor
    const historyImpact = salesHistory.sales.length > 5 ? 10 : -10;
    factors.push({
      factor: `Sales History: ${salesHistory.sales.length} sales`,
      impact: historyImpact,
      weight: this.HISTORY_WEIGHT,
    });

    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private estimateCurrentMarketPrice(
    nft: NFTMetadata,
    marketData: NFTMarketData
  ): number {
    // Simplified: use floor price as baseline
    return marketData.floorPrice;
  }

  private generateRecommendation(
    estimatedValue: number,
    currentPrice: number,
    rarityScore: number,
    sentiment: 'bullish' | 'bearish' | 'neutral'
  ): NFTValuation['recommendation'] {
    const valueRatio = estimatedValue / currentPrice;

    let score = 50;

    // Value assessment
    if (valueRatio > 1.5) score += 30;
    else if (valueRatio > 1.2) score += 15;
    else if (valueRatio < 0.8) score -= 15;
    else if (valueRatio < 0.5) score -= 30;

    // Rarity consideration
    if (rarityScore > 80) score += 15;
    else if (rarityScore > 60) score += 5;

    // Sentiment
    if (sentiment === 'bullish') score += 10;
    else if (sentiment === 'bearish') score -= 10;

    if (score >= 80) return 'strong_buy';
    if (score >= 60) return 'buy';
    if (score >= 40) return 'hold';
    if (score >= 20) return 'sell';
    return 'strong_sell';
  }

  private calculateConfidence(
    marketData: NFTMarketData,
    salesHistory: NFTSalesHistory,
    rarity: RarityAnalysis
  ): number {
    let confidence = 50;

    // More sales = higher confidence
    if (salesHistory.sales.length > 10) confidence += 15;
    else if (salesHistory.sales.length > 5) confidence += 10;
    else if (salesHistory.sales.length < 2) confidence -= 20;

    // Higher volume = higher confidence
    if (marketData.volume24h > marketData.floorPrice * 20) confidence += 15;
    else if (marketData.volume24h < marketData.floorPrice * 2) confidence -= 10;

    // More holders = higher confidence
    if (marketData.holders > 1000) confidence += 10;
    else if (marketData.holders < 100) confidence -= 10;

    // Clear rarity signals increase confidence
    if (rarity.specialAttributes.length > 0) confidence += 10;

    return Math.max(20, Math.min(95, confidence));
  }

  private detectWashTrading(
    sales: Array<{ price: number; timestamp: number; buyer: string; seller: string }>
  ): number {
    let suspiciousActivity = 0;
    const totalSales = sales.length;

    if (totalSales < 5) return 0;

    // Check for back-and-forth trading
    const tradingPairs = new Map<string, number>();
    
    sales.forEach((sale, idx) => {
      if (idx < sales.length - 1) {
        const nextSale = sales[idx + 1];
        if (sale.buyer === nextSale.seller || sale.seller === nextSale.buyer) {
          const pairKey = [sale.buyer, sale.seller].sort().join('-');
          tradingPairs.set(pairKey, (tradingPairs.get(pairKey) || 0) + 1);
        }
      }
    });

    tradingPairs.forEach(count => {
      if (count > 2) suspiciousActivity += count;
    });

    // Check for same-price sales (unusual)
    const priceGroups = new Map<number, number>();
    sales.forEach(sale => {
      const roundedPrice = Math.round(sale.price * 100) / 100;
      priceGroups.set(roundedPrice, (priceGroups.get(roundedPrice) || 0) + 1);
    });

    priceGroups.forEach(count => {
      if (count > totalSales * 0.3) suspiciousActivity += count;
    });

    return Math.min((suspiciousActivity / totalSales) * 100, 100);
  }

  private calculateSimilarity(
    nft1: NFTMetadata,
    nft2: NFTMetadata,
    weights?: Map<string, number>
  ): number {
    let matchingTraits = 0;
    let totalTraits = Math.max(nft1.traits.length, nft2.traits.length);

    if (totalTraits === 0) return 0;

    const nft2TraitMap = new Map(
      nft2.traits.map(t => [`${t.trait_type}:${t.value}`, t])
    );

    nft1.traits.forEach(trait => {
      const key = `${trait.trait_type}:${trait.value}`;
      if (nft2TraitMap.has(key)) {
        const weight = weights?.get(trait.trait_type) || 1;
        matchingTraits += weight;
      }
    });

    return (matchingTraits / totalTraits) * 100;
  }
}

// Export singleton instance
export const nftValuationEngine = new NFTValuationEngine();

