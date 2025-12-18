import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { envConfig } from './config/envs';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // conectionString is read from env variable DATABASE_URL
    const adapter = new PrismaPg({ connectionString: envConfig.databaseUrl });
    super({ adapter });
  }
}
