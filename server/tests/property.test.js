/**
 * PROPERTY ENDPOINTS TESTS
 */

const request = require('supertest');
const app = require('../app');

describe('Property Endpoints', () => {
  let ownerToken;
  let propertyId;

  // Setup: Register owner user
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `owner${Date.now()}@example.com`,
        password: 'Owner@1234',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER'
      });
    ownerToken = response.body.data.accessToken;
  });

  // Test create property
  test('POST /api/properties/create - should create property', async () => {
    const propertyData = {
      title: 'Beautiful 2BHK Apartment',
      description: 'A spacious and well-furnished 2BHK apartment in the heart of the city with all modern amenities.',
      price: 25000,
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      type: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      amenities: ['WiFi', 'Parking', 'Gym', 'Security'],
      images: ['https://example.com/image1.jpg']
    };

    const response = await request(app)
      .post('/api/properties/create')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(propertyData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.property).toHaveProperty('id');
    expect(response.body.data.property.title).toBe(propertyData.title);

    propertyId = response.body.data.property.id;
  });

  // Test get all properties
  test('GET /api/properties/all - should get all properties', async () => {
    const response = await request(app)
      .get('/api/properties/all')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data.properties)).toBe(true);
  });

  // Test get property by ID
  test('GET /api/properties/:id - should get property details', async () => {
    const response = await request(app)
      .get(`/api/properties/${propertyId}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.property.id).toBe(propertyId);
  });

  // Test search properties
  test('GET /api/properties/search - should search properties', async () => {
    const response = await request(app)
      .get('/api/properties/search?city=Mumbai&type=APARTMENT')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data.properties)).toBe(true);
  });

  // Test update property
  test('PUT /api/properties/update/:id - should update property', async () => {
    const updateData = {
      price: 28000,
      isAvailable: true
    };

    const response = await request(app)
      .put(`/api/properties/update/${propertyId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.property.price).toBe(28000);
  });

  // Test delete property
  test('DELETE /api/properties/delete/:id - should delete property', async () => {
    const response = await request(app)
      .delete(`/api/properties/delete/${propertyId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});