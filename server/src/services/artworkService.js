const { pool } = require('../config/db');
const AppError = require('../utils/AppError');

function serializeArtwork(row) {
  if (!row) return null;
  let settings = row.settings;
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = null;
    }
  }
  return { ...row, settings };
}

async function listArtworksForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, title, ascii_content, original_filename, settings, created_at, updated_at
     FROM artworks WHERE user_id = :userId ORDER BY created_at DESC`,
    { userId },
  );
  return rows.map(serializeArtwork);
}

async function getArtworkById(id) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, title, ascii_content, original_filename, settings, created_at, updated_at
     FROM artworks WHERE id = :id LIMIT 1`,
    { id },
  );
  return serializeArtwork(rows[0]);
}

async function getOwnedArtwork(id, userId) {
  const artwork = await getArtworkById(id);
  if (!artwork) {
    throw new AppError('Artwork not found', 404);
  }
  if (artwork.user_id !== userId) {
    throw new AppError('You do not have access to this artwork', 403);
  }
  return artwork;
}

async function createArtwork(userId, { title, asciiContent, originalFilename, settings }) {
  const [result] = await pool.execute(
    `INSERT INTO artworks (user_id, title, ascii_content, original_filename, settings)
     VALUES (:userId, :title, :asciiContent, :originalFilename, :settings)`,
    {
      userId,
      title: title.trim(),
      asciiContent,
      originalFilename,
      settings: settings ? JSON.stringify(settings) : null,
    },
  );
  return getArtworkById(result.insertId);
}

async function updateArtwork(id, userId, updates) {
  await getOwnedArtwork(id, userId); // ensures existence + ownership

  const fields = [];
  const params = { id };

  if (updates.title !== undefined) {
    fields.push('title = :title');
    params.title = updates.title.trim();
  }
  if (updates.asciiContent !== undefined) {
    fields.push('ascii_content = :asciiContent');
    params.asciiContent = updates.asciiContent;
  }
  if (updates.settings !== undefined) {
    fields.push('settings = :settings');
    params.settings = JSON.stringify(updates.settings);
  }

  if (fields.length === 0) {
    return getArtworkById(id);
  }

  await pool.execute(
    `UPDATE artworks SET ${fields.join(', ')} WHERE id = :id`,
    params,
  );
  return getArtworkById(id);
}

async function deleteArtwork(id, userId) {
  await getOwnedArtwork(id, userId);
  await pool.execute('DELETE FROM artworks WHERE id = :id', { id });
}

module.exports = {
  listArtworksForUser,
  getArtworkById,
  getOwnedArtwork,
  createArtwork,
  updateArtwork,
  deleteArtwork,
};
