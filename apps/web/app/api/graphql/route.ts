import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/graphql
 * GraphQL API endpoint for flexible data queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json(
        { errors: [{ message: 'Query is required' }] },
        { status: 400 }
      );
    }

    // Simple GraphQL resolver (in production, use a proper GraphQL library)
    const result = await executeGraphQLQuery(query, variables || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('GraphQL API error:', error);
    return NextResponse.json(
      {
        errors: [
          {
            message: 'GraphQL execution error',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      },
      { status: 500 }
    );
  }
}

async function executeGraphQLQuery(query: string, variables: Record<string, any>) {
  // Simple query parser and executor
  // In production, use a proper GraphQL library like graphql-js

  const projects = await findAllProjects();

  // Handle queries
  if (query.includes('projects')) {
    let filteredProjects = [...projects];

    // Apply filters from variables
    if (variables.status) {
      filteredProjects = filteredProjects.filter((p) => p.status === variables.status);
    }

    if (variables.chains && Array.isArray(variables.chains)) {
      filteredProjects = filteredProjects.filter((p) =>
        p.chains?.some((c) => variables.chains.includes(c))
      );
    }

    if (variables.search) {
      const searchLower = variables.search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.projectId.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const limit = variables.limit || 50;
    const offset = variables.offset || 0;
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    return {
      data: {
        projects: paginatedProjects.map((p) => ({
          id: p.projectId,
          name: p.name,
          slug: p.slug,
          status: p.status,
          chains: p.chains || [],
          criteria: p.criteria || [],
          snapshotDate: p.snapshotDate,
          claimUrl: p.claimUrl,
          estimatedValue: p.estimatedValue,
        })),
        totalCount: filteredProjects.length,
      },
    };
  }

  if (query.includes('stats')) {
    return {
      data: {
        stats: {
          total: projects.length,
          confirmed: projects.filter((p) => p.status === 'confirmed').length,
          rumored: projects.filter((p) => p.status === 'rumored').length,
          speculative: projects.filter((p) => p.status === 'speculative').length,
        },
      },
    };
  }

  // Default: return schema info
  return {
    data: {
      __schema: {
        types: [
          {
            name: 'Project',
            fields: [
              { name: 'id', type: 'String' },
              { name: 'name', type: 'String' },
              { name: 'status', type: 'String' },
              { name: 'chains', type: '[String]' },
            ],
          },
        ],
      },
    },
  };
}

