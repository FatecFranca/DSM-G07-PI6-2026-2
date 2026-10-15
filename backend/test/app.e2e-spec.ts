import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

jest.setTimeout(30000);

interface AuthResponse {
  accessToken: string;
}

interface RegionResponse {
  id: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'tecnico@cafe-pi.local',
      senha: 'Dev123456!',
    });
    token = (login.body as AuthResponse).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects private routes without a token', () => {
    return request(app.getHttpServer()).get('/regioes').expect(401);
  });

  it('lists regions with a valid token', () => {
    return request(app.getHttpServer())
      .get('/regioes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('creates and reads a climate record', async () => {
    const regions = await request(app.getHttpServer())
      .get('/regioes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const regionList = regions.body as RegionResponse[];

    await request(app.getHttpServer())
      .post('/clima')
      .set('Authorization', `Bearer ${token}`)
      .send({
        regiaoId: regionList[0].id,
        data: '2026-02-15',
        temperaturaMedia: 22.1,
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/clima/${regionList[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('returns the preliminary clusters', () => {
    return request(app.getHttpServer())
      .get('/clusters')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
