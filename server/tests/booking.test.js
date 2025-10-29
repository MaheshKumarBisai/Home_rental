const request = require('supertest');
const app = require('../app');
const { User, Property, Booking } = require('../models');
const { Op } = require('sequelize');

describe('Booking and Application Endpoints', () => {
  let ownerToken, renterToken;
  let ownerId, renterId;
  let propertyId;
  let bookingId;

  // Setup: Create an OWNER and a RENTER user, and a property
  beforeAll(async () => {
    // Clean up
    await User.destroy({ where: { email: { [Op.like]: '%@bookingtest.com' } } });

    // Create Owner
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'owner@bookingtest.com',
        password: 'password123',
        fullName: 'Booking Owner',
        role: 'OWNER',
      });
    const ownerLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'owner@bookingtest.com',
            password: 'password123',
        });
    ownerToken = ownerLoginRes.body.data.accessToken;
    ownerId = ownerLoginRes.body.data.user.id;

    // Create Renter
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'renter@bookingtest.com',
        password: 'password123',
        fullName: 'Booking Renter',
        role: 'RENTER',
      });
    const renterLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'renter@bookingtest.com',
            password: 'password123',
        });
    renterToken = renterLoginRes.body.data.accessToken;
    renterId = renterLoginRes.body.data.user.id;

    // Create Property
    const propertyRes = await request(app)
      .post('/api/properties/create')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Booking Test Property',
        description: 'A property for testing the booking flow.',
        price: 10000,
        listingType: 'RENT',
        type: 'APARTMENT',
        address: '456 Booking Ave',
        city: 'Booksville',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Test'],
        images: ['http://example.com/test.jpg'],
      });
    propertyId = propertyRes.body.data.property.id;
  });

  it('should allow a RENTER to apply for a property', async () => {
    const res = await request(app)
      .post('/api/bookings/apply')
      .set('Authorization', `Bearer ${renterToken}`)
      .send({ propertyId });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.application.status).toBe('PENDING');
    bookingId = res.body.data.application.id;
  });

  it('should allow an OWNER to view applications for their properties', async () => {
    const res = await request(app)
      .get('/api/bookings/owner')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.bookings.length).toBeGreaterThan(0);
  });

  it('should allow an OWNER to ACCEPT an application', async () => {
    const res = await request(app)
      .put(`/api/bookings/applications/${bookingId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'ACCEPTED' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.application.status).toBe('ACCEPTED');
  });

  it('should verify the property is marked as "Booked" after an application is accepted', async () => {
    const res = await request(app).get(`/api/properties/${propertyId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.property.availability).toBe('Booked');
  });
});
