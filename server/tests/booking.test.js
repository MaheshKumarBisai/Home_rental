/**
 * BOOKING ENDPOINTS TESTS
 */

const request = require('supertest');
const app = require('../app');

describe('Booking Endpoints', () => {
  let renterToken, ownerToken;
  let propertyId, bookingId;

  // Setup
  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `owner${Date.now()}@example.com`,
        password: 'Owner@1234',
        firstName: 'Owner',
        lastName: 'Test',
        role: 'OWNER'
      });
    ownerToken = ownerRes.body.data.accessToken;

    // Create property
    const propertyRes = await request(app)
      .post('/api/properties/create')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Test Property for Booking',
        description: 'A nice property for testing booking functionality with all required fields.',
        price: 5000,
        address: '456 Test Street',
        city: 'Delhi',
        type: 'HOUSE',
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi'],
        images: ['https://example.com/test.jpg']
      });
    propertyId = propertyRes.body.data.property.id;

    // Register renter
    const renterRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `renter${Date.now()}@example.com`,
        password: 'Renter@1234',
        firstName: 'Renter',
        lastName: 'Test',
        role: 'RENTER'
      });
    renterToken = renterRes.body.data.accessToken;
  });

  // Test create booking
  test('POST /api/bookings/create - should create booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);

    const bookingData = {
      propertyId,
      checkInDate: tomorrow.toISOString(),
      checkOutDate: nextWeek.toISOString()
    };

    const response = await request(app)
      .post('/api/bookings/create')
      .set('Authorization', `Bearer ${renterToken}`)
      .send(bookingData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.booking).toHaveProperty('id');
    expect(response.body.data.booking.status).toBe('CONFIRMED');

    bookingId = response.body.data.booking.id;
  });

  // Test double booking prevention
  test('POST /api/bookings/create - should prevent double booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 6);

    const bookingData = {
      propertyId,
      checkInDate: tomorrow.toISOString(),
      checkOutDate: nextWeek.toISOString()
    };

    const response = await request(app)
      .post('/api/bookings/create')
      .set('Authorization', `Bearer ${renterToken}`)
      .send(bookingData)
      .expect(409);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('already booked');
  });

  // Test cancel booking
  test('DELETE /api/bookings/cancel/:id - should cancel booking', async () => {
    const response = await request(app)
      .delete(`/api/bookings/cancel/${bookingId}`)
      .set('Authorization', `Bearer ${renterToken}`)
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});