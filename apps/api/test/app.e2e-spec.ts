import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupSwagger } from './../src/swagger';

jest.setTimeout(60_000);

describe('Current Global API (e2e)', () => {
  let app: INestApplication<App>;

  const stamp = Date.now().toString(36);
  const password = 'Password123!';
  const userA = {
    email: `e2ea-${stamp}@example.com`,
    username: `e2ea${stamp}`.slice(0, 30),
    password,
    displayName: 'E2E A',
  };
  const userB = {
    email: `e2eb-${stamp}@example.com`,
    username: `e2eb${stamp}`.slice(0, 30),
    password,
    displayName: 'E2E B',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health y GET /api/docs', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });

    const docs = await request(app.getHttpServer()).get('/api/docs');
    expect([200, 301, 302]).toContain(docs.status);
  });

  it('rechaza un registro inválido', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'no-es-email', username: 'X', password: 'corta', displayName: '' })
      .expect(400);
  });

  it('cubre auth, post, follow, feed, notificaciones y chat', async () => {
    const http = request(app.getHttpServer());

    const registeredA = await http
      .post('/api/auth/register')
      .send(userA)
      .expect(201);
    expect(registeredA.body.accessToken).toEqual(expect.any(String));
    expect(registeredA.body.user.username).toBe(userA.username);

    const registeredB = await http
      .post('/api/auth/register')
      .send(userB)
      .expect(201);

    const loginA = await http
      .post('/api/auth/login')
      .send({ email: userA.email, password })
      .expect(200);
    const tokenA = loginA.body.accessToken as string;
    const tokenB = registeredB.body.accessToken as string;

    const me = await http
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(me.body.email).toBe(userA.email);
    expect(me.body.username).toBe(userA.username);

    const postA = await http
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: `e2e post ${stamp}` })
      .expect(201);
    const postId = postA.body.id as string;

    const postB = await http
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: `e2e post b ${stamp}` })
      .expect(201);

    const like = await http
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(like.body).toMatchObject({ liked: true, likesCount: 1 });

    const comment = await http
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'comentario e2e' })
      .expect(201);
    const commentId = comment.body.id as string;

    const heart = await http
      .post(`/api/posts/comments/${commentId}/reactions`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ emoji: 'HEART' })
      .expect(200);
    expect(heart.body.reaction.counts.HEART).toBe(1);
    expect(heart.body.reaction.actorEmoji).toBe('HEART');

    await http
      .post(`/api/users/${userB.username}/follow`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(201);

    const following = await http
      .get('/api/feed')
      .query({ type: 'following' })
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(
      following.body.data.some((item: { id: string }) => item.id === postB.body.id),
    ).toBe(true);

    const globalFeed = await http
      .get('/api/feed')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(
      globalFeed.body.data.some((item: { id: string }) => item.id === postId),
    ).toBe(true);

    const notifications = await http
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const types = notifications.body.data.map((item: { type: string }) => item.type);
    expect(types).toEqual(expect.arrayContaining(['LIKE', 'COMMENT']));

    const notificationsB = await http
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(
      notificationsB.body.data.some((item: { type: string }) => item.type === 'FOLLOW'),
    ).toBe(true);

    const conversation = await http
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ username: userA.username })
      .expect(200);
    const conversationId = conversation.body.id as string;

    const message = await http
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'hola e2e' })
      .expect(201);

    const messageReaction = await http
      .post(`/api/chat/messages/${message.body.id}/reactions`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ emoji: 'LIKE' })
      .expect(200);
    expect(messageReaction.body.reaction.counts.LIKE).toBe(1);
    expect(messageReaction.body.reaction.actorEmoji).toBe('LIKE');
  });
});
