/**
 * AUTH ENDPOINTS TESTS
 */

const request = require('supertest');
const app = require('../app');

describe('Authentication Endpoints', () => {
  let accessToken;
  let refreshToken;
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test@1234',
    firstName: 'Test',
    lastName: 'User',
    role: 'RENTER'
  };

  // Test user registration
  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  // Test duplicate registration
  test('POST /api/auth/register - should fail for duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('already exists');
  });

  // Test login
  test('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('accessToken');
  });

  // Test invalid login
  test('POST /api/auth/login - should fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.status).toBe('error');
  });

  // Test get profile
  test('GET /api/auth/profile - should get user profile', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  // Test protected route without token
  test('GET /api/auth/profile - should fail without token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .expect(401);

    expect(response.body.status).toBe('error');
  });

  // Test refresh token
  test('POST /api/auth/refresh - should refresh access token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('accessToken');
  });

  // Test logout
  test('POST /api/auth/logout - should logout user', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});