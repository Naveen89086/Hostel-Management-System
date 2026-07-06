import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelhub',
  jwtSecret: process.env.JWT_SECRET || 'hostelhub-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  xaiApiKey: process.env.XAI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
