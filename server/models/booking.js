const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PENDING',
  },
});

module.exports = Booking;
