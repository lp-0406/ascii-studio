const request = require('supertest');
const app = require('../src/app');
const { resetDatabase, closeDatabase } = require('./setup/testDb');
const { makeTestImageBuffer } = require('./setup/fixtures');

let token;

beforeEach(async () => {
  await resetDatabase();
  const res = await request(app).post('/api/auth/register').send({
    name: 'ASCII Tester',
    email: 'ascii.tester@example.com',
    password: 'SuperSecret123',
  });
  token = res.body.data.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /api/ascii/generate', () => {
  it('rejects requests without authentication', async () => {
    const res = await request(app).post('/api/ascii/generate');
    expect(res.status).toBe(401);
  });

  it('rejects requests with no image file', async () => {
    const res = await request(app)
      .post('/api/ascii/generate')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('rejects invalid file types', async () => {
    const res = await request(app)
      .post('/api/ascii/generate')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('not an image'), { filename: 'file.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });

  it('rejects oversized files', async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB > 5MB limit
    const res = await request(app)
      .post('/api/ascii/generate')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', bigBuffer, { filename: 'big.png', contentType: 'image/png' });

    expect(res.status).toBe(413);
  });

  it('converts a valid image into ASCII art with default settings', async () => {
    const image = await makeTestImageBuffer();

    const res = await request(app)
      .post('/api/ascii/generate')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', image, { filename: 'test.png', contentType: 'image/png' })
      .field('width', '40');

    expect(res.status).toBe(200);
    expect(res.body.data.asciiContent.length).toBeGreaterThan(0);
    expect(res.body.data.settings.width).toBe(40);
    // width in characters should match requested width
    const firstLine = res.body.data.asciiContent.split('\n')[0];
    expect(firstLine.length).toBe(40);
  });

  it('respects custom conversion settings (invert, charset, width)', async () => {
    const image = await makeTestImageBuffer();

    const res = await request(app)
      .post('/api/ascii/generate')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', image, { filename: 'test.png', contentType: 'image/png' })
      .field('width', '25')
      .field('charset', '#. ')
      .field('invert', 'true')
      .field('brightness', '10')
      .field('contrast', '5');

    expect(res.status).toBe(200);
    expect(res.body.data.settings.width).toBe(25);
    expect(res.body.data.settings.invert).toBe(true);
    expect(res.body.data.settings.charset).toBe('#. ');
  });
});
