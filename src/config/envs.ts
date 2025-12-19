import 'dotenv/config';
import * as Joi from 'joi';

const envSchema = Joi.object({
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  PRODUCTS_MICROSERVICE_HOST: Joi.string().required(),
  ORDER_MICROSERVICE_PORT: Joi.number().required(),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  productsMicroservice: {
    host: envVars.PRODUCTS_MICROSERVICE_HOST,
    port: envVars.ORDER_MICROSERVICE_PORT,
  },
};
