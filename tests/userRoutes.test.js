const request = require('supertest');
const app = require('../app');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtil');

describe('User Routes', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Recherchez l'utilisateur avec l'e-mail mass@gmail.com
    const user = await UserModel.findByEmail('mass@gmail.com');

    if (!user) {
      // Si l'utilisateur n'existe pas, créez-le
      const newUser = await UserModel.createUser({
        nom: 'Test',
        prenom: 'User',
        email: 'mass@gmail.com',
        mot_de_passe: 'password123',
        telephone: '1234567890',
        statut: 'active',
        groupe: 'testgroup',
      });

      userId = newUser.id;
      token = generateToken(newUser);
    } else {
      userId = user.id;
      token = generateToken(user);
    }
  });

 
  it('should update the user email to updateduser@example.com', async () => {
    const updatedData = {
      nom: 'Updated',
      prenom: 'User',
      email: 'updateduser@example.com',
      telephone: '0987654321',
      statut: 'inactive',
      groupe: 'updatedgroup',
    };

    const resUpdate = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    console.log(resUpdate.body); // Ajoutez ce log pour voir la réponse
    expect(resUpdate.statusCode).toEqual(200);
    expect(resUpdate.body).toHaveProperty('message', 'User updated successfully');
    expect(resUpdate.body.user).toMatchObject(updatedData);

    // Vérifiez que les modifications ont été appliquées
    const resGet = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log(resGet.body); // Ajoutez ce log pour voir la réponse
    expect(resGet.statusCode).toEqual(200);
    expect(resGet.body).toMatchObject(updatedData);
  });
});