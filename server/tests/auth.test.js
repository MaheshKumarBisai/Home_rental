const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  let testRenter;
  let testOwner;

  beforeAll(async () => {
    // Clean up database before tests
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Test data
  const renterData = {
    email: 'renter@test.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Renter',
    role: 'RENTER',
  };

  const ownerData = {
    email: 'owner@test.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Owner',
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
    testRenter = res.body.data;
  });

  it('should register a new OWNER successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(ownerData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.user.email).toBe(ownerData.email);
    expect(res.body.data.user.role).toBe('OWNER');
    testOwner = res.body.data;
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
  });

  it('should fail to log in with an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: renterData.email, password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });
});
