import request from 'supertest';
import { app } from '../index';

describe('Backend API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        service: 'realtime-chat-backend'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api', () => {
    it('should return API status', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Chat API is running',
        version: '1.0.0'
      });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toMatchObject({
        message: 'Route not found'
      });
    });
  });
});