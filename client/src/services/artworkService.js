import api from './api';

export function generateAscii(file, settings) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('width', settings.width);
  formData.append('charset', settings.charset);
  formData.append('invert', settings.invert);
  formData.append('brightness', settings.brightness);
  formData.append('contrast', settings.contrast);

  return api
    .post('/ascii/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data);
}

export const listArtworks = () => api.get('/artworks').then((r) => r.data.data.artworks);
export const getArtwork = (id) => api.get(`/artworks/${id}`).then((r) => r.data.data.artwork);
export const createArtwork = (payload) => api.post('/artworks', payload).then((r) => r.data.data.artwork);
export const updateArtwork = (id, payload) => api.put(`/artworks/${id}`, payload).then((r) => r.data.data.artwork);
export const deleteArtwork = (id) => api.delete(`/artworks/${id}`).then((r) => r.data);
export const shareArtwork = (id) => api.post(`/artworks/${id}/share`).then((r) => r.data.data);
export const getSharedArtwork = (token) => api.get(`/share/${token}`).then((r) => r.data.data.artwork);
