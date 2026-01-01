import 'dotenv/config';
import * as joi from 'joi';

const envSchema = joi.object({
  DATABASE_URL: joi.string().required(),
  NATS_SERVERS: joi.array().items(joi.string()).required(),
}).unknown(true);

const { error, value: envVars } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig = {
  databaseUrl: envVars.DATABASE_URL,
  natsServers: envVars.NATS_SERVERS,
};
