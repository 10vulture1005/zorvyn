import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: process.env.REFRESH_SECRET || 'refresh_supersecret_change_in_production',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d'
};
