import mongoose from 'mongoose';
import { env } from '../env/env';
import { logger } from '../logger/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

const CONNECTION_OPTIONS = {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  waitQueueTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export const connectDB = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, CONNECTION_OPTIONS);
    logger.info('✅ MongoDB conectado exitosamente');
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error(`❌ Error de conexión a MongoDB: ${errorMessage}`);

    if (retries > 0) {
      logger.warn(`Reintentando conexión en ${RETRY_INTERVAL / 1000}s... (${retries} intento(s) restante(s))`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(retries - 1);
    }

    throw new Error(`Error de conexión a MongoDB después de ${MAX_RETRIES} reintentos. Último error: ${errorMessage}`);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB desconectado. Intentando reconectar...');
  connectDB(1).catch((error) => {
    logger.error(`❌ Error al reconectar: ${getErrorMessage(error)}`);
  });
});

mongoose.connection.on('error', (err) => {
  logger.error(`❌ Error de MongoDB: ${getErrorMessage(err)}`);
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} recibido. Cerrando conexión a MongoDB...`);
  await mongoose.connection.close();
  logger.info('Conexión a MongoDB cerrada');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default mongoose;
