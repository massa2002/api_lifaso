const request = require('supertest');
const express = require('express');
const { getQuartiles } = require('../controllers/score_quartileController');

// Crée une application Express simulée
const app = express();
app.get('/quartiles', getQuartiles);

jest.mock('../utils/firebaseAdmin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };
  return {
    firestore: () => firestoreMock,
  };
});

const mockFirestore = require('../utils/firebaseAdmin').firestore();

describe('GET /quartiles', () => {
  it('devrait retourner les quartiles si le document existe', async () => {
    // Mock Firestore pour retourner un document existant
    mockFirestore.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ quartile1: 25, quartile2: 50, quartile3: 75 }),
    });

    const response = await request(app).get('/quartiles');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ quartile1: 25, quartile2: 50, quartile3: 75 });
  });

  it('devrait retourner une erreur 404 si le document des quartiles n\'existe pas', async () => {
    // Mock Firestore pour retourner un document inexistant
    mockFirestore.get.mockResolvedValueOnce({ exists: false });

    const response = await request(app).get('/quartiles');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Quartiles document not found.' });
  });

  it('devrait retourner une erreur 500 en cas de problème avec Firestore', async () => {
    // Mock Firestore pour simuler une erreur
    mockFirestore.get.mockRejectedValueOnce(new Error('Firestore error'));

    const response = await request(app).get('/quartiles');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch quartiles.' });
  });
});