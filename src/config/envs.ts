import 'dotenv/config';
import * as Joi from 'joi';

const envSchema = Joi.object({
  PORT: Joi.number(),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig = {
  port: envVars.PORT,
};
