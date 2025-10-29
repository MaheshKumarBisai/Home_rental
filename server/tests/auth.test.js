const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Authentication Endpoints', () => {
  let testRenterToken;

  // Test data
  const renterData = {
    email: 'renter@test.com',
    password: 'password123',
    fullName: 'Test Renter',
    role: 'RENTER',
  };

  const ownerData = {
    email: 'owner@test.com',
    password: 'password123',
    fullName: 'Test Owner',
    role: 'OWNER',
  };

  // Registration Tests
  it('should register a new RENTER successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(renterData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.user.email).toBe(renterData.email);
    expect(res.body.data.user.role).toBe('RENTER');
  });

  it('should register a new OWNER successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(ownerData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.user.email).toBe(ownerData.email);
    expect(res.body.data.user.role).toBe('OWNER');
  });

  it('should fail to register a user with a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(renterData);
    expect(res.statusCode).toEqual(400);
  });

  // Login Tests
  it('should log in an existing RENTER', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: renterData.email, password: renterData.password });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('accessToken');
    testRenterToken = res.body.data.accessToken;
  });

  it('should fail to log in with an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: renterData.email, password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });

  // Profile Tests
  it('should get the profile of the logged-in user', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${testRenterToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.email).toBe(renterData.email);
  });
});
