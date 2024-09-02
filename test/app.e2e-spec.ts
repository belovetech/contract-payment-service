import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './../src/prismaClient/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(PrismaService)
      // .useValue(mockDeep<PrismaClient>())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // prismaMock = app.get(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('#Profiles', () => {
    it('/profiles (GET)', () => {
      return request(app.getHttpServer()).get('/profiles').expect(200);
    });

    it('/profiles/me (GET)', () => {
      return request(app.getHttpServer())
        .get('/profiles/me')
        .set('profile_id', '27')
        .expect(200);
    });
  });
});
