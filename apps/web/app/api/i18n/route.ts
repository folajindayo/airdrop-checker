import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/i18n
 * Get internationalization translations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Translation data (in production, load from translation files)
    const translations: Record<string, Record<string, string>> = {
      en: {
        'dashboard.title': 'Airdrop Dashboard',
        'dashboard.overallScore': 'Overall Score',
        'dashboard.eligibleAirdrops': 'Eligible Airdrops',
        'portfolio.totalValue': 'Total Portfolio Value',
        'portfolio.byChain': 'By Chain',
        'portfolio.topTokens': 'Top Tokens',
        'roi.totalGasSpent': 'Total Gas Spent',
        'roi.potentialValue': 'Potential Value',
        'roi.calculator': 'ROI Calculator',
        'airdrop.status.confirmed': 'Confirmed',
        'airdrop.status.rumored': 'Rumored',
        'airdrop.status.speculative': 'Speculative',
        'airdrop.status.expired': 'Expired',
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.retry': 'Retry',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
      },
      es: {
        'dashboard.title': 'Panel de Airdrops',
        'dashboard.overallScore': 'Puntuación General',
        'dashboard.eligibleAirdrops': 'Airdrops Elegibles',
        'portfolio.totalValue': 'Valor Total del Portafolio',
        'portfolio.byChain': 'Por Cadena',
        'portfolio.topTokens': 'Tokens Principales',
        'roi.totalGasSpent': 'Gas Total Gastado',
        'roi.potentialValue': 'Valor Potencial',
        'roi.calculator': 'Calculadora de ROI',
        'airdrop.status.confirmed': 'Confirmado',
        'airdrop.status.rumored': 'Rumoreado',
        'airdrop.status.speculative': 'Especulativo',
        'airdrop.status.expired': 'Expirado',
        'common.loading': 'Cargando...',
        'common.error': 'Ocurrió un error',
        'common.retry': 'Reintentar',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
      },
      zh: {
        'dashboard.title': '空投仪表板',
        'dashboard.overallScore': '总体得分',
        'dashboard.eligibleAirdrops': '符合条件的空投',
        'portfolio.totalValue': '投资组合总价值',
        'portfolio.byChain': '按链',
        'portfolio.topTokens': '顶级代币',
        'roi.totalGasSpent': '总Gas费用',
        'roi.potentialValue': '潜在价值',
        'roi.calculator': '投资回报率计算器',
        'airdrop.status.confirmed': '已确认',
        'airdrop.status.rumored': '传闻',
        'airdrop.status.speculative': '推测',
        'airdrop.status.expired': '已过期',
        'common.loading': '加载中...',
        'common.error': '发生错误',
        'common.retry': '重试',
        'common.save': '保存',
        'common.cancel': '取消',
      },
      ja: {
        'dashboard.title': 'エアドロップダッシュボード',
        'dashboard.overallScore': '総合スコア',
        'dashboard.eligibleAirdrops': '対象エアドロップ',
        'portfolio.totalValue': 'ポートフォリオ総額',
        'portfolio.byChain': 'チェーン別',
        'portfolio.topTokens': 'トップトークン',
        'roi.totalGasSpent': '総ガス費用',
        'roi.potentialValue': '潜在価値',
        'roi.calculator': 'ROI計算機',
        'airdrop.status.confirmed': '確認済み',
        'airdrop.status.rumored': '噂',
        'airdrop.status.speculative': '推測',
        'airdrop.status.expired': '期限切れ',
        'common.loading': '読み込み中...',
        'common.error': 'エラーが発生しました',
        'common.retry': '再試行',
        'common.save': '保存',
        'common.cancel': 'キャンセル',
      },
    };

    const langData = translations[lang] || translations.en;
    const supportedLanguages = Object.keys(translations);

    return NextResponse.json({
      success: true,
      language: lang,
      translations: langData,
      supportedLanguages,
      defaultLanguage: 'en',
    });
  } catch (error) {
    console.error('i18n API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch translations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

