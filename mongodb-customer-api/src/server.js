import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('Set MONGODB_URI in .env'); process.exit(1); }
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.syncIndexes();
  const port = Number(process.env.PORT ?? 3000);
  const server = app.listen(port, () => console.log('Customer API listening on port ' + port));
  const shutdown = async () => { server.close(); await mongoose.disconnect(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) { console.error('MongoDB connection failed:', error.message); process.exit(1); }
