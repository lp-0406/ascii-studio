const request = require('supertest');
const app = require('../src/app');
const { resetDatabase, closeDatabase } = require('./setup/testDb');

let tokenA;
let tokenB;

const sampleArtwork = {
  title: 'My Test Artwork',
  asciiContent: '@@@@\n####\n....',
  originalFilename: 'test.png',
  settings: { width: 40, charset: '@%#*+=-:. ', invert: false, brightness: 0, contrast: 0 },
};

beforeEach(async () => {
  await resetDatabase();

  const resA = await request(app).post('/api/auth/register').send({
    name: 'User A',
    email: 'user.a@example.com',
    password: 'SuperSecret123',
  });
  tokenA = resA.body.data.token;

  const resB = await request(app).post('/api/auth/register').send({
    name: 'User B',
    email: 'user.b@example.com',
    password: 'SuperSecret123',
  });
  tokenB = resB.body.data.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe('Artwork CRUD', () => {
  it('creates a new artwork', async () => {
    const res = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);

    expect(res.status).toBe(201);
    expect(res.body.data.artwork.title).toBe(sampleArtwork.title);
    expect(res.body.data.artwork.settings.width).toBe(40);
  });

  it('lists only the authenticated user\'s artworks', async () => {
    await request(app).post('/api/artworks').set('Authorization', `Bearer ${tokenA}`).send(sampleArtwork);
    await request(app).post('/api/artworks').set('Authorization', `Bearer ${tokenB}`).send(sampleArtwork);

    const res = await request(app).get('/api/artworks').set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.artworks).toHaveLength(1);
  });

  it('retrieves a single artwork by id', async () => {
    const createRes = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);
    const id = createRes.body.data.artwork.id;

    const res = await request(app).get(`/api/artworks/${id}`).set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.artwork.id).toBe(id);
  });

  it('updates an artwork title', async () => {
    const createRes = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);
    const id = createRes.body.data.artwork.id;

    const res = await request(app)
      .put(`/api/artworks/${id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.artwork.title).toBe('Updated Title');
  });

  it('deletes an artwork', async () => {
    const createRes = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);
    const id = createRes.body.data.artwork.id;

    const delRes = await request(app).delete(`/api/artworks/${id}`).set('Authorization', `Bearer ${tokenA}`);
    expect(delRes.status).toBe(200);

    const getRes = await request(app).get(`/api/artworks/${id}`).set('Authorization', `Bearer ${tokenA}`);
    expect(getRes.status).toBe(404);
  });

  it('prevents a user from accessing another user\'s artwork', async () => {
    const createRes = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);
    const id = createRes.body.data.artwork.id;

    const res = await request(app).get(`/api/artworks/${id}`).set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it('prevents a user from deleting another user\'s artwork', async () => {
    const createRes = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleArtwork);
    const id = createRes.body.data.artwork.id;

    const res = await request(app).delete(`/api/artworks/${id}`).set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });
});
