/**
 * @fileoverview Tests for Postman collection generator
 */

import {
  PostmanGenerator,
  generatePostmanCollection,
  PostmanRequest,
  PostmanFolder,
} from '@/lib/docs/postman-generator';

describe('Postman Generator', () => {
  let generator: PostmanGenerator;

  beforeEach(() => {
    generator = new PostmanGenerator({
      name: 'Test API',
      description: 'Test API Collection',
    });
  });

  describe('Basic Configuration', () => {
    it('should initialize with config', () => {
      expect(generator).toBeDefined();
    });

    it('should generate basic collection', () => {
      const collection = generator.generate();

      expect(collection.info.name).toBe('Test API');
      expect(collection.info.description).toBe('Test API Collection');
      expect(collection.info.schema).toContain('v2.1.0');
    });

    it('should set version', () => {
      generator.setVersion('1.0.0');
      const collection = generator.generate();

      expect(collection.info.version).toBe('1.0.0');
    });
  });

  describe('Request Registration', () => {
    it('should add a simple request', () => {
      const request: PostmanRequest = {
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item).toHaveLength(1);
      expect(collection.item[0].name).toBe('Get Users');
    });

    it('should add request with description', () => {
      const request: PostmanRequest = {
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        description: 'Retrieve all users',
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.description).toBe('Retrieve all users');
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

      methods.forEach((method) => {
        generator.addRequest({
          name: `Test ${method}`,
          method,
          url: 'https://api.example.com/test',
        });
      });

      const collection = generator.generate();

      expect(collection.item).toHaveLength(5);
    });

    it('should handle URL with variables', () => {
      const request: PostmanRequest = {
        name: 'Get User by ID',
        method: 'GET',
        url: '{{baseUrl}}/users/{{userId}}',
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.url.raw).toContain('{{baseUrl}}');
      expect(collection.item[0].request.url.raw).toContain('{{userId}}');
    });
  });

  describe('Request Headers', () => {
    it('should add headers to request', () => {
      const request: PostmanRequest = {
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{token}}' },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.header).toHaveLength(2);
      expect(collection.item[0].request.header[0].key).toBe('Content-Type');
    });

    it('should handle disabled headers', () => {
      const request: PostmanRequest = {
        name: 'Test',
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: [
          { key: 'X-Custom', value: 'test', disabled: true },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.header[0].disabled).toBe(true);
    });
  });

  describe('Request Body', () => {
    it('should add JSON body', () => {
      const request: PostmanRequest = {
        name: 'Create User',
        method: 'POST',
        url: 'https://api.example.com/users',
        body: {
          mode: 'raw',
          raw: JSON.stringify({ name: 'John', email: 'john@example.com' }),
          options: { raw: { language: 'json' } },
        },
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.body.mode).toBe('raw');
      expect(collection.item[0].request.body.raw).toContain('John');
    });

    it('should add form data', () => {
      const request: PostmanRequest = {
        name: 'Upload File',
        method: 'POST',
        url: 'https://api.example.com/upload',
        body: {
          mode: 'formdata',
          formdata: [
            { key: 'file', type: 'file', src: '/path/to/file' },
            { key: 'name', value: 'Document' },
          ],
        },
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.body.mode).toBe('formdata');
      expect(collection.item[0].request.body.formdata).toHaveLength(2);
    });

    it('should add urlencoded body', () => {
      const request: PostmanRequest = {
        name: 'Submit Form',
        method: 'POST',
        url: 'https://api.example.com/form',
        body: {
          mode: 'urlencoded',
          urlencoded: [
            { key: 'username', value: 'john' },
            { key: 'password', value: 'secret' },
          ],
        },
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.body.mode).toBe('urlencoded');
    });
  });

  describe('Query Parameters', () => {
    it('should add query parameters', () => {
      const request: PostmanRequest = {
        name: 'Search Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        query: [
          { key: 'page', value: '1' },
          { key: 'limit', value: '10' },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.url.query).toHaveLength(2);
      expect(collection.item[0].request.url.query[0].key).toBe('page');
    });

    it('should handle disabled query params', () => {
      const request: PostmanRequest = {
        name: 'Test',
        method: 'GET',
        url: 'https://api.example.com/test',
        query: [
          { key: 'debug', value: 'true', disabled: true },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].request.url.query[0].disabled).toBe(true);
    });
  });

  describe('Folders', () => {
    it('should create folders', () => {
      const folder: PostmanFolder = {
        name: 'User Management',
        description: 'User-related endpoints',
      };

      generator.addFolder(folder);
      const collection = generator.generate();

      expect(collection.item).toHaveLength(1);
      expect(collection.item[0].name).toBe('User Management');
    });

    it('should add requests to folder', () => {
      generator.addFolder({ name: 'Users' });

      generator.addRequest(
        {
          name: 'Get Users',
          method: 'GET',
          url: 'https://api.example.com/users',
        },
        'Users'
      );

      const collection = generator.generate();

      expect(collection.item[0].item).toHaveLength(1);
      expect(collection.item[0].item[0].name).toBe('Get Users');
    });

    it('should handle nested folders', () => {
      generator.addFolder({ name: 'API' });
      generator.addFolder({ name: 'Users', parent: 'API' });

      const collection = generator.generate();

      expect(collection.item[0].name).toBe('API');
      expect(collection.item[0].item[0].name).toBe('Users');
    });
  });

  describe('Variables', () => {
    it('should add collection variables', () => {
      generator.addVariable('baseUrl', 'https://api.example.com');
      generator.addVariable('apiKey', 'secret-key');

      const collection = generator.generate();

      expect(collection.variable).toHaveLength(2);
      expect(collection.variable[0].key).toBe('baseUrl');
      expect(collection.variable[0].value).toBe('https://api.example.com');
    });

    it('should handle variable types', () => {
      generator.addVariable('url', 'https://example.com', 'string');
      generator.addVariable('isEnabled', true, 'boolean');
      generator.addVariable('count', 42, 'number');

      const collection = generator.generate();

      expect(collection.variable).toHaveLength(3);
    });
  });

  describe('Authentication', () => {
    it('should add API key auth', () => {
      generator.setAuth({
        type: 'apikey',
        apikey: [
          { key: 'key', value: 'X-API-Key' },
          { key: 'value', value: '{{apiKey}}' },
          { key: 'in', value: 'header' },
        ],
      });

      const collection = generator.generate();

      expect(collection.auth.type).toBe('apikey');
    });

    it('should add bearer token auth', () => {
      generator.setAuth({
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{bearerToken}}' }],
      });

      const collection = generator.generate();

      expect(collection.auth.type).toBe('bearer');
    });

    it('should add basic auth', () => {
      generator.setAuth({
        type: 'basic',
        basic: [
          { key: 'username', value: '{{username}}' },
          { key: 'password', value: '{{password}}' },
        ],
      });

      const collection = generator.generate();

      expect(collection.auth.type).toBe('basic');
    });
  });

  describe('Examples', () => {
    it('should add example responses', () => {
      const request: PostmanRequest = {
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        responses: [
          {
            name: 'Success',
            code: 200,
            status: 'OK',
            body: JSON.stringify([{ id: 1, name: 'John' }]),
            headers: [{ key: 'Content-Type', value: 'application/json' }],
          },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].response).toHaveLength(1);
      expect(collection.item[0].response[0].name).toBe('Success');
      expect(collection.item[0].response[0].code).toBe(200);
    });

    it('should add multiple examples', () => {
      const request: PostmanRequest = {
        name: 'Get User',
        method: 'GET',
        url: 'https://api.example.com/users/1',
        responses: [
          {
            name: 'Success',
            code: 200,
            status: 'OK',
            body: JSON.stringify({ id: 1, name: 'John' }),
          },
          {
            name: 'Not Found',
            code: 404,
            status: 'Not Found',
            body: JSON.stringify({ error: 'User not found' }),
          },
        ],
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].response).toHaveLength(2);
    });
  });

  describe('Events', () => {
    it('should add pre-request script', () => {
      const request: PostmanRequest = {
        name: 'Test',
        method: 'GET',
        url: 'https://api.example.com/test',
        preRequestScript: `
          pm.environment.set('timestamp', new Date().toISOString());
        `,
      };

      generator.addRequest(request);
      const collection = generator.generate();

      expect(collection.item[0].event).toBeDefined();
      const preRequest = collection.item[0].event.find(
        (e: any) => e.listen === 'prerequest'
      );
      expect(preRequest).toBeDefined();
    });

    it('should add test script', () => {
      const request: PostmanRequest = {
        name: 'Test',
        method: 'GET',
        url: 'https://api.example.com/test',
        testScript: `
          pm.test('Status is 200', () => {
            pm.response.to.have.status(200);
          });
        `,
      };

      generator.addRequest(request);
      const collection = generator.generate();

      const test = collection.item[0].event.find(
        (e: any) => e.listen === 'test'
      );
      expect(test).toBeDefined();
    });
  });

  describe('JSON Output', () => {
    it('should output valid JSON', () => {
      generator.addRequest({
        name: 'Test',
        method: 'GET',
        url: 'https://api.example.com/test',
      });

      const json = generator.toJSON();

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should format JSON with indentation', () => {
      const json = generator.toJSON(2);

      expect(json).toContain('  ');
    });
  });

  describe('File Export', () => {
    it('should generate file name', () => {
      const fileName = generator.getFileName();

      expect(fileName).toContain('Test-API');
      expect(fileName).toContain('.postman_collection.json');
    });
  });

  describe('Utility Function', () => {
    it('should generate collection with utility function', () => {
      const requests: PostmanRequest[] = [
        {
          name: 'Get Users',
          method: 'GET',
          url: 'https://api.example.com/users',
        },
      ];

      const collection = generatePostmanCollection(
        {
          name: 'Test API',
          description: 'Test',
        },
        requests
      );

      expect(collection.item).toHaveLength(1);
    });
  });

  describe('Complex Collection', () => {
    it('should generate complete collection', () => {
      generator.setVersion('1.0.0');
      generator.addVariable('baseUrl', 'https://api.example.com');
      generator.addVariable('apiKey', 'secret');

      generator.setAuth({
        type: 'apikey',
        apikey: [
          { key: 'key', value: 'X-API-Key' },
          { key: 'value', value: '{{apiKey}}' },
        ],
      });

      generator.addFolder({ name: 'Users' });

      generator.addRequest(
        {
          name: 'Get Users',
          method: 'GET',
          url: '{{baseUrl}}/users',
          headers: [
            { key: 'Content-Type', value: 'application/json' },
          ],
          query: [
            { key: 'page', value: '1' },
          ],
          responses: [
            {
              name: 'Success',
              code: 200,
              status: 'OK',
              body: JSON.stringify([]),
            },
          ],
        },
        'Users'
      );

      const collection = generator.generate();

      expect(collection.info.version).toBe('1.0.0');
      expect(collection.variable).toHaveLength(2);
      expect(collection.auth).toBeDefined();
      expect(collection.item[0].item).toHaveLength(1);
    });
  });
});

