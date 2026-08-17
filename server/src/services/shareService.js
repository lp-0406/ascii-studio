const crypto = require('crypto');
const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const artworkService = require('../services/artworkService');

function generateShareToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function createShareLink(artworkId, userId) {
  // Confirms the requesting user owns the artwork before sharing it.
  await artworkService.getOwnedArtwork(artworkId, userId);

  const [existing] = await pool.execute(
    'SELECT id, share_token, is_public FROM shared_artworks WHERE artwork_id = :artworkId LIMIT 1',
    { artworkId },
  );

  if (existing[0]) {
    await pool.execute(
      'UPDATE shared_artworks SET is_public = TRUE WHERE id = :id',
      { id: existing[0].id },
    );
    return { shareToken: existing[0].share_token, isPublic: true };
  }

  const shareToken = generateShareToken();
  await pool.execute(
    'INSERT INTO shared_artworks (artwork_id, share_token, is_public) VALUES (:artworkId, :shareToken, TRUE)',
    { artworkId, shareToken },
  );

  return { shareToken, isPublic: true };
}

async function getPublicArtworkByToken(shareToken) {
  const [rows] = await pool.execute(
    `SELECT a.id, a.title, a.ascii_content, a.original_filename, a.settings, a.created_at,
            s.is_public
     FROM shared_artworks s
     JOIN artworks a ON a.id = s.artwork_id
     WHERE s.share_token = :shareToken LIMIT 1`,
    { shareToken },
  );

  const row = rows[0];
  if (!row || !row.is_public) {
    throw new AppError('Shared artwork not found', 404);
  }

  let settings = row.settings;
  if (typeof settings === 'string') {
    try { settings = JSON.parse(settings); } catch (e) { settings = null; }
  }

  // Never expose user identity/ownership details on the public endpoint.
  return {
    id: row.id,
    title: row.title,
    asciiContent: row.ascii_content,
    originalFilename: row.original_filename,
    settings,
    createdAt: row.created_at,
  };
}

module.exports = { createShareLink, getPublicArtworkByToken };
