/**
 * TOKEN UTILITIES
 * JWT token generation and management
 */

const jwt = require("jsonwebtoken");
const { RefreshToken, User } = require("../models");

/**
 * Generate access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

/**
 * Save refresh token to database
 */
const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Remove any existing tokens for this user
  await RefreshToken.destroy({ where: { userId } });

  // Save the new token
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await RefreshToken.findOne({
      where: { token },
      include: { model: User, as: "user" },
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > storedToken.expiresAt) {
      await RefreshToken.destroy({ where: { token } });
      throw new Error("Refresh token expired");
    }

    return storedToken.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete refresh token
 */
const deleteRefreshToken = async (token) => {
  await RefreshToken.destroy({
    where: { token },
  });
};

/**
 * Delete all user refresh tokens
 */
const deleteAllUserTokens = async (userId) => {
  await RefreshToken.destroy({
    where: { userId },
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
};
