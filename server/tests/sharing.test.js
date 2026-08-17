const request = require('supertest');
const app = require('../src/app');
const { resetDatabase, closeDatabase } = require('./setup/testDb');

let token;
let artworkId;

const sampleArtwork = {
  title: 'Shareable Art',
  asciiContent: '@@@@\n####\n....',
  originalFilename: 'test.png',
  settings: { width: 40, charset: '@%#*+=-:. ', invert: false, brightness: 0, contrast: 0 },
};

beforeEach(async () => {
  await resetDatabase();

  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Share Tester',
    email: 'share.tester@example.com',
    password: 'SuperSecret123',
  });
  token = registerRes.body.data.token;

  const createRes = await request(app)
    .post('/api/artworks')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleArtwork);
  artworkId = createRes.body.data.artwork.id;
});

afterAll(async () => {
  await closeDatabase();
});

describe('Artwork sharing', () => {
  it('creates a public share link for an owned artwork', async () => {
    const res = await request(app)
      .post(`/api/artworks/${artworkId}/share`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.shareToken).toEqual(expect.any(String));
    expect(res.body.data.isPublic).toBe(true);
  });

  it('allows anyone to access a public shared artwork without auth', async () => {
    const shareRes = await request(app)
      .post(`/api/artworks/${artworkId}/share`)
      .set('Authorization', `Bearer ${token}`);
    const { shareToken } = shareRes.body.data;

    const res = await request(app).get(`/api/share/${shareToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.artwork.title).toBe(sampleArtwork.title);
    expect(res.body.data.artwork.userId).toBeUndefined();
  });

  it('rejects access to a non-existent share token', async () => {
    const res = await request(app).get('/api/share/does-not-exist-token');
    expect(res.status).toBe(404);
  });

  it('does not expose a share link for artworks that were never shared', async () => {
    const res = await request(app).get('/api/share/some-random-unshared-token');
    expect(res.status).toBe(404);
  });
});
