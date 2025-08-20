const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
      
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('NASA API Endpoints', () => {
  test('GET /api/nasa/apod should return APOD data', async () => {
    const response = await request(app)
      .get('/api/nasa/apod')
      .expect(200);
      
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('timestamp');
  }, 10000);

  test('GET /api/nasa/apod with invalid date should return 400', async () => {
    const response = await request(app)
      .get('/api/nasa/apod?date=invalid-date')
      .expect(400);
      
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/nasa/mars-photos/curiosity should return photos', async () => {
    const response = await request(app)
      .get('/api/nasa/mars-photos/curiosity?sol=1000')
      .expect(200);
      
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  }, 10000);

  test('GET /api/nasa/mars-photos/invalid-rover should return 400', async () => {
    const response = await request(app)
      .get('/api/nasa/mars-photos/invalid-rover')
      .expect(400);
      
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/nasa/search without query should return 400', async () => {
    const response = await request(app)
      .get('/api/nasa/search')
      .expect(400);
      
    expect(response.body).toHaveProperty('success', false);
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent-route should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent-route')
      .expect(404);
      
    expect(response.body).toHaveProperty('success', false);
  });
});
