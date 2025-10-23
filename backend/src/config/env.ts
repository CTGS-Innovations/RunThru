import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH || './database/runthru.db',
  ttsServiceUrl: process.env.TTS_SERVICE_URL || 'http://localhost:5000',
  pinCode: process.env.PIN_CODE || '1234',
  audioCacheDir: process.env.AUDIO_CACHE_DIR || './data/audio-cache',
  scriptsDir: process.env.SCRIPTS_DIR || './data/scripts',
};
