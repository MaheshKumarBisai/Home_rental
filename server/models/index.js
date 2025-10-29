const sequelize = require('../config/database');
const User = require('./user');
const Property = require('./property');
const Booking = require('./booking');
const Review = require('./review');
const Wishlist = require('./wishlist');
const RefreshToken = require('./refreshToken');
const Message = require('./message');

// User and RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User and Message (Sender)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User and Message (Receiver)
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Booking and Message
Booking.hasMany(Message, { foreignKey: 'bookingId', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// User and Property
User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User and Booking
User.hasMany(Booking, { foreignKey: 'renterId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });

// Property and Booking
Property.hasMany(Booking, { foreignKey: 'propertyId', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// User and Review
User.hasMany(Review, { foreignKey: 'renterId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });

// Property and Review
Property.hasMany(Review, { foreignKey: 'propertyId', as: 'reviews' });
Review.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// User and Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Property and Wishlist
Property.hasMany(Wishlist, { foreignKey: 'propertyId', as: 'wishlistedBy' });
Wishlist.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });


const db = {
  sequelize,
  User,
  Property,
  Booking,
  Review,
  Wishlist,
  RefreshToken,
  Message,
};

module.exports = db;
