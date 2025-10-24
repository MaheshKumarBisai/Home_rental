/**
 * TOKEN UTILITIES
 * JWT token generation and management
 */

const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

  // Use upsert to avoid unique constraint errors when the same token already exists.
  // If a record with the token exists, update its expiresAt and userId; otherwise create it.
  await prisma.refreshToken.upsert({
    where: { token },
    update: { expiresAt, userId },
    create: { token, userId, expiresAt },
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { token } });
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
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Delete all user refresh tokens
 */
const deleteAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
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
