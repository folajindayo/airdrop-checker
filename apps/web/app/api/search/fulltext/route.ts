import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * POST /api/search/fulltext
 * Full-text search across all project fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, fields, fuzzy = false, limit = 50 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const projects = await findAllProjects();
    const queryLower = query.toLowerCase().trim();
    const queryTerms = queryLower.split(/\s+/);

    // Full-text search with scoring
    const results = projects
      .map((project) => {
        let score = 0;
        const matches: string[] = [];

        // Search in name
        const nameLower = project.name.toLowerCase();
        if (nameLower.includes(queryLower)) {
          score += 10;
          matches.push('name');
        }
        queryTerms.forEach((term) => {
          if (nameLower.includes(term)) {
            score += 5;
          }
        });

        // Search in project ID
        if (project.projectId.toLowerCase().includes(queryLower)) {
          score += 8;
          matches.push('id');
        }

        // Search in slug
        if (project.slug.toLowerCase().includes(queryLower)) {
          score += 6;
          matches.push('slug');
        }

        // Search in description
        if (project.description) {
          const descLower = project.description.toLowerCase();
          if (descLower.includes(queryLower)) {
            score += 4;
            matches.push('description');
          }
          queryTerms.forEach((term) => {
            if (descLower.includes(term)) {
              score += 2;
            }
          });
        }

        // Search in tags
        if (project.tags) {
          project.tags.forEach((tag) => {
            if (tag.toLowerCase().includes(queryLower)) {
              score += 3;
              matches.push('tag');
            }
          });
        }

        // Search in chains
        if (project.chains) {
          project.chains.forEach((chain) => {
            if (chain.toLowerCase().includes(queryLower)) {
              score += 2;
              matches.push('chain');
            }
          });
        }

        // Fuzzy matching (simple implementation)
        if (fuzzy && score === 0) {
          // Check for similar strings (Levenshtein-like)
          const similarity = calculateSimilarity(queryLower, nameLower);
          if (similarity > 0.7) {
            score = Math.round(similarity * 5);
            matches.push('fuzzy');
          }
        }

        return {
          project,
          score,
          matches: [...new Set(matches)],
        };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((result) => ({
        projectId: result.project.projectId,
        name: result.project.name,
        slug: result.project.slug,
        status: result.project.status,
        chains: result.project.chains || [],
        score: result.score,
        matchedFields: result.matches,
        snippet: generateSnippet(result.project, queryLower),
      }));

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
      fuzzy,
    });
  } catch (error) {
    console.error('Full-text search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform full-text search',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple similarity calculation (in production, use proper Levenshtein)
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function generateSnippet(project: any, query: string): string {
  // Generate a snippet highlighting the match
  if (project.description) {
    const descLower = project.description.toLowerCase();
    const index = descLower.indexOf(query);
    if (index !== -1) {
      const start = Math.max(0, index - 50);
      const end = Math.min(project.description.length, index + query.length + 50);
      return '...' + project.description.slice(start, end) + '...';
    }
  }
  return project.description || project.name;
}

