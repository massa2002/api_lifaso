const request = require('supertest');
const app = require('../app');
const UserModel = require('../models/userModel');

describe('Auth Routes', () => {
  let userId;

  beforeAll(async () => {
    // Créez un utilisateur pour les tests
    const newUser = {
      nom: 'Test',
      prenom: 'User',
      email: 'testuser@example.com',
      mot_de_passe: 'password123',
      telephone: '1234567890',
      statut: 'active',
      groupe: 'testgroup',
    };
    const user = await UserModel.createUser(newUser);
    userId = user.id;
  });

  afterAll(async () => {
    // Supprimez l'utilisateur de test
    await UserModel.deleteUser(userId);
  });

  it('should login the user and return a token', async () => {
    const loginData = {
      email: 'testuser@example.com',
      mot_de_passe: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    console.log(res.body); // Ajoutez ce log pour voir la réponse
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});