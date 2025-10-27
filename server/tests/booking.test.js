const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Booking and Application Endpoints', () => {
  let ownerToken, renterToken;
  let ownerId, renterId;
  let propertyId;
  let bookingId;

  // Setup: Create an OWNER and a RENTER user, and a property
  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: { contains: '@bookingtest.com' } } });

    // Create Owner
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'owner@bookingtest.com',
        password: 'password123',
        firstName: 'Booking',
        lastName: 'Owner',
        role: 'OWNER',
      });
    ownerToken = ownerRes.body.data.accessToken;
    ownerId = ownerRes.body.data.user.id;

    // Create Renter
    const renterRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'renter@bookingtest.com',
        password: 'password123',
        firstName: 'Booking',
        lastName: 'Renter',
        role: 'RENTER',
      });
    renterToken = renterRes.body.data.accessToken;
    renterId = renterRes.body.data.user.id;

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
        amenities: 'Test',
        images: 'test.jpg',
      });
    propertyId = propertyRes.body.data.property.id;
  });

  afterAll(async () => {
    await prisma.property.deleteMany({ where: { ownerId } });
    await prisma.user.deleteMany({ where: { id: ownerId } });
    await prisma.user.deleteMany({ where: { id: renterId } });
    await prisma.$disconnect();
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
