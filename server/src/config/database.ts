import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/focovest',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'focovest-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
  },
  server: {
    port: parseInt(process.env.PORT || '5000'),
    env: process.env.NODE_ENV || 'development'
  }
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri)
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    // Don't throw the error to allow server to start without DB
  }
}