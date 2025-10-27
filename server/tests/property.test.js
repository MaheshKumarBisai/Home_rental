const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Property Endpoints', () => {
  let ownerToken;
  let ownerId;
  let propertyId;

  // Setup: Create an OWNER user and get a token
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'propertyowner@test.com' } });
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'propertyowner@test.com',
        password: 'password123',
        firstName: 'Property',
        lastName: 'Owner',
        role: 'OWNER',
      });
    ownerToken = ownerRes.body.data.accessToken;
    ownerId = ownerRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.property.deleteMany({ where: { ownerId } });
    await prisma.user.deleteMany({ where: { id: ownerId } });
    await prisma.$disconnect();
  });

  // Test data for a new property
  const newProperty = {
    title: 'Modern Test Apartment',
    description: 'A beautiful and modern test apartment with great views.',
    price: 50000,
    listingType: 'RENT',
    type: 'APARTMENT',
    address: '123 Test St',
    city: 'Testville',
    bedrooms: 2,
    bathrooms: 2,
    amenities: 'WiFi,Parking',
    images: 'image1.jpg,image2.jpg',
  };

  it('should allow an OWNER to create a new property', async () => {
    const res = await request(app)
      .post('/api/properties/create')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(newProperty);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.property.title).toBe(newProperty.title);
    propertyId = res.body.data.property.id;
  });

  it('should fetch a list of all properties', async () => {
    const res = await request(app).get('/api/properties/all');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.properties.length).toBeGreaterThan(0);
  });

  it('should fetch details for a single property', async () => {
    const res = await request(app).get(`/api/properties/${propertyId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.property.id).toBe(propertyId);
  });

  it('should allow an OWNER to update their property', async () => {
    const res = await request(app)
      .put(`/api/properties/update/${propertyId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated Test Apartment' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.property.title).toBe('Updated Test Apartment');
  });

  it('should allow an OWNER to delete their property', async () => {
    const res = await request(app)
      .delete(`/api/properties/delete/${propertyId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
