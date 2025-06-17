const admin = require('../utils/firebaseAdmin');
const DataModel = require('../models/dataModel');

// Mock Firebase Firestore
jest.mock('../utils/firebaseAdmin', () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn(),
        set: jest.fn(),
    };
    return {
        firestore: jest.fn(() => firestoreMock),
    };
});

describe('DataModel.calculerEtEnregistrerIndices', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('devrait calculer et enregistrer les indices correctement', async () => {
        // Mock des données Firestore
        const mockReponses = [
            { alimentation: 10, education: 20, pauvrete: 5, violence: 3, sante_physique: 15, cadre_vie: 8 },
            { alimentation: 5, education: 10, pauvrete: 2, violence: 1, sante_physique: 7, cadre_vie: 4 },
        ];

        admin.firestore().collection().get.mockResolvedValue({
            empty: false,
            forEach: (callback) => mockReponses.forEach((data, index) => callback({ id: `doc${index}`, data: () => data })),
        });

        admin.firestore().collection().doc().set.mockResolvedValue();

        // Appeler la méthode
        await DataModel.calculerEtEnregistrerIndices(req, res);

        // Vérifier les totaux calculés
        const expectedTotaux = {
            alimentation: 15,
            education: 30,
            pauvrete: 7,
            violence: 4,
            sante_physique: 22,
            cadre_vie: 12,
        };

        expect(admin.firestore().collection).toHaveBeenCalledWith('reponse');
        expect(admin.firestore().collection().doc).toHaveBeenCalledWith('indices');
        expect(admin.firestore().collection().doc().set).toHaveBeenCalledWith(expectedTotaux);

        // Vérifier la réponse
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Indices calculés et enregistrés avec succès.',
            data: expectedTotaux,
        });
    });

    it('devrait retourner une erreur si aucun document n’est trouvé', async () => {
        // Mock pour une collection vide
        admin.firestore().collection().get.mockResolvedValue({
            empty: true,
        });

        // Appeler la méthode
        await DataModel.calculerEtEnregistrerIndices(req, res);

        // Vérifier la réponse
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Aucun document trouvé dans la collection "reponse".',
        });
    });

    it('devrait gérer les erreurs correctement', async () => {
        // Mock pour une erreur Firestore
        admin.firestore().collection().get.mockRejectedValue(new Error('Erreur Firestore'));

        // Appeler la méthode
        await DataModel.calculerEtEnregistrerIndices(req, res);

        // Vérifier la réponse
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erreur lors du calcul des indices.',
            error: 'Erreur Firestore',
        });
    });
});