import request from 'supertest';
import app from '../src/server';

describe('Basic Integration Test', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
  });

  it('should require authentication for protected routes', async () => {
    const response = await request(app)
      .get('/api/buildings')
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});
