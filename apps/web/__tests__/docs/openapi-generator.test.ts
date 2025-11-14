/**
 * @fileoverview Tests for OpenAPI generator
 */

import {
  OpenAPIGenerator,
  generateOpenAPISpec,
  OpenAPIRoute,
  OpenAPIParameter,
  OpenAPIResponse,
} from '@/lib/docs/openapi-generator';

describe('OpenAPI Generator', () => {
  let generator: OpenAPIGenerator;

  beforeEach(() => {
    generator = new OpenAPIGenerator({
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API documentation',
    });
  });

  describe('Basic Configuration', () => {
    it('should initialize with config', () => {
      expect(generator).toBeDefined();
    });

    it('should generate basic spec', () => {
      const spec = generator.generate();

      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Test API');
      expect(spec.info.version).toBe('1.0.0');
    });

    it('should include description', () => {
      const spec = generator.generate();

      expect(spec.info.description).toBe('Test API documentation');
    });

    it('should set servers', () => {
      generator.setServers([
        { url: 'https://api.example.com', description: 'Production' },
        { url: 'http://localhost:3000', description: 'Development' },
      ]);

      const spec = generator.generate();

      expect(spec.servers).toHaveLength(2);
      expect(spec.servers?.[0].url).toBe('https://api.example.com');
    });
  });

  describe('Route Registration', () => {
    it('should register a route', () => {
      const route: OpenAPIRoute = {
        path: '/api/users',
        method: 'get',
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
      };

      generator.addRoute(route);
      const spec = generator.generate();

      expect(spec.paths['/api/users']).toBeDefined();
      expect(spec.paths['/api/users'].get).toBeDefined();
    });

    it('should register multiple methods for same path', () => {
      generator.addRoute({
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
      });

      generator.addRoute({
        path: '/api/users',
        method: 'post',
        summary: 'Create user',
      });

      const spec = generator.generate();

      expect(spec.paths['/api/users'].get).toBeDefined();
      expect(spec.paths['/api/users'].post).toBeDefined();
    });

    it('should handle path parameters', () => {
      const route: OpenAPIRoute = {
        path: '/api/users/{id}',
        method: 'get',
        summary: 'Get user by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
      };

      generator.addRoute(route);
      const spec = generator.generate();

      expect(spec.paths['/api/users/{id}'].get.parameters).toHaveLength(1);
      expect(spec.paths['/api/users/{id}'].get.parameters[0].name).toBe('id');
    });

    it('should handle query parameters', () => {
      const route: OpenAPIRoute = {
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
          },
        ],
      };

      generator.addRoute(route);
      const spec = generator.generate();

      const params = spec.paths['/api/users'].get.parameters;
      expect(params).toHaveLength(1);
      expect(params[0].in).toBe('query');
    });

    it('should handle request body', () => {
      const route: OpenAPIRoute = {
        path: '/api/users',
        method: 'post',
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      };

      generator.addRoute(route);
      const spec = generator.generate();

      expect(spec.paths['/api/users'].post.requestBody).toBeDefined();
      expect(spec.paths['/api/users'].post.requestBody.required).toBe(true);
    });

    it('should handle responses', () => {
      const route: OpenAPIRoute = {
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          '404': {
            description: 'Not found',
          },
        },
      };

      generator.addRoute(route);
      const spec = generator.generate();

      expect(spec.paths['/api/users'].get.responses['200']).toBeDefined();
      expect(spec.paths['/api/users'].get.responses['404']).toBeDefined();
    });

    it('should handle tags', () => {
      const route: OpenAPIRoute = {
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
        tags: ['Users', 'Public'],
      };

      generator.addRoute(route);
      const spec = generator.generate();

      expect(spec.paths['/api/users'].get.tags).toEqual(['Users', 'Public']);
    });
  });

  describe('Schema Definitions', () => {
    it('should add schema component', () => {
      generator.addSchema('User', {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['id', 'name', 'email'],
      });

      const spec = generator.generate();

      expect(spec.components.schemas.User).toBeDefined();
      expect(spec.components.schemas.User.properties).toHaveProperty('id');
    });

    it('should reference schema in routes', () => {
      generator.addSchema('User', {
        type: 'object',
        properties: { id: { type: 'string' } },
      });

      generator.addRoute({
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      });

      const spec = generator.generate();

      expect(
        spec.paths['/api/users'].get.responses['200'].content['application/json']
          .schema.$ref
      ).toBe('#/components/schemas/User');
    });
  });

  describe('Security Schemes', () => {
    it('should add API key security', () => {
      generator.addSecurityScheme('ApiKey', {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      });

      const spec = generator.generate();

      expect(spec.components.securitySchemes.ApiKey).toBeDefined();
      expect(spec.components.securitySchemes.ApiKey.type).toBe('apiKey');
    });

    it('should add bearer token security', () => {
      generator.addSecurityScheme('BearerAuth', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });

      const spec = generator.generate();

      expect(spec.components.securitySchemes.BearerAuth.scheme).toBe('bearer');
    });

    it('should add OAuth2 security', () => {
      generator.addSecurityScheme('OAuth2', {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {
              'read:users': 'Read users',
              'write:users': 'Write users',
            },
          },
        },
      });

      const spec = generator.generate();

      expect(spec.components.securitySchemes.OAuth2.type).toBe('oauth2');
    });

    it('should apply security to routes', () => {
      generator.addSecurityScheme('ApiKey', {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      });

      generator.addRoute({
        path: '/api/protected',
        method: 'get',
        summary: 'Protected endpoint',
        security: [{ ApiKey: [] }],
      });

      const spec = generator.generate();

      expect(spec.paths['/api/protected'].get.security).toEqual([
        { ApiKey: [] },
      ]);
    });
  });

  describe('Tags', () => {
    it('should add tags', () => {
      generator.addTag({
        name: 'Users',
        description: 'User management endpoints',
      });

      const spec = generator.generate();

      expect(spec.tags).toHaveLength(1);
      expect(spec.tags[0].name).toBe('Users');
    });

    it('should add multiple tags', () => {
      generator.addTag({ name: 'Users', description: 'Users' });
      generator.addTag({ name: 'Posts', description: 'Posts' });

      const spec = generator.generate();

      expect(spec.tags).toHaveLength(2);
    });

    it('should support external docs in tags', () => {
      generator.addTag({
        name: 'Users',
        description: 'Users',
        externalDocs: {
          description: 'Find more info',
          url: 'https://example.com/docs',
        },
      });

      const spec = generator.generate();

      expect(spec.tags[0].externalDocs).toBeDefined();
    });
  });

  describe('External Documentation', () => {
    it('should set external docs', () => {
      generator.setExternalDocs({
        description: 'API Documentation',
        url: 'https://example.com/docs',
      });

      const spec = generator.generate();

      expect(spec.externalDocs).toBeDefined();
      expect(spec.externalDocs?.url).toBe('https://example.com/docs');
    });
  });

  describe('Contact Information', () => {
    it('should set contact info', () => {
      generator.setContact({
        name: 'API Support',
        email: 'support@example.com',
        url: 'https://example.com/support',
      });

      const spec = generator.generate();

      expect(spec.info.contact).toBeDefined();
      expect(spec.info.contact?.email).toBe('support@example.com');
    });
  });

  describe('License Information', () => {
    it('should set license', () => {
      generator.setLicense({
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      });

      const spec = generator.generate();

      expect(spec.info.license).toBeDefined();
      expect(spec.info.license?.name).toBe('MIT');
    });
  });

  describe('JSON Output', () => {
    it('should output valid JSON', () => {
      generator.addRoute({
        path: '/api/test',
        method: 'get',
        summary: 'Test endpoint',
      });

      const json = generator.toJSON();

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should format JSON with indentation', () => {
      const json = generator.toJSON(2);

      expect(json).toContain('  ');
    });
  });

  describe('YAML Output', () => {
    it('should output YAML format', () => {
      generator.addRoute({
        path: '/api/test',
        method: 'get',
        summary: 'Test endpoint',
      });

      const yaml = generator.toYAML();

      expect(yaml).toContain('openapi:');
      expect(yaml).toContain('paths:');
    });
  });

  describe('Utility Function', () => {
    it('should generate spec with utility function', () => {
      const routes: OpenAPIRoute[] = [
        {
          path: '/api/users',
          method: 'get',
          summary: 'Get users',
        },
      ];

      const spec = generateOpenAPISpec(
        {
          title: 'Test API',
          version: '1.0.0',
        },
        routes
      );

      expect(spec.paths['/api/users']).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      expect(() => {
        generator.addRoute({
          path: '',
          method: 'get',
          summary: 'Test',
        });
      }).toThrow();
    });

    it('should validate method types', () => {
      expect(() => {
        generator.addRoute({
          path: '/api/test',
          method: 'invalid' as any,
          summary: 'Test',
        });
      }).toThrow();
    });

    it('should validate parameter locations', () => {
      expect(() => {
        generator.addRoute({
          path: '/api/test',
          method: 'get',
          summary: 'Test',
          parameters: [
            {
              name: 'test',
              in: 'invalid' as any,
              schema: { type: 'string' },
            },
          ],
        });
      }).toThrow();
    });
  });

  describe('Complex Examples', () => {
    it('should handle complete API spec', () => {
      generator.setServers([
        { url: 'https://api.example.com' },
      ]);

      generator.addTag({
        name: 'Users',
        description: 'User endpoints',
      });

      generator.addSchema('User', {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      });

      generator.addSecurityScheme('BearerAuth', {
        type: 'http',
        scheme: 'bearer',
      });

      generator.addRoute({
        path: '/api/users',
        method: 'get',
        summary: 'Get users',
        tags: ['Users'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      });

      const spec = generator.generate();

      expect(spec.paths['/api/users']).toBeDefined();
      expect(spec.components.schemas.User).toBeDefined();
      expect(spec.components.securitySchemes.BearerAuth).toBeDefined();
    });
  });
});

