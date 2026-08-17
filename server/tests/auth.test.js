const request = require('supertest');
const app = require('../src/app');
const { resetDatabase, closeDatabase } = require('./setup/testDb');

const validUser = {
  name: 'Test User',
  email: 'test.user@example.com',
  password: 'SuperSecret123',
};

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });

  it('rejects weak/invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the authenticated user profile', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const { token } = registerRes.body.data;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});
