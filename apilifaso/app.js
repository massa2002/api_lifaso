const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const questionRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const enqueteRoutes = require('./routes/enqueteRoutes');
const choixreponseRoutes = require('./routes/choixreponseRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dataNuageRoutes = require('./routes/dataRoutes');
const createUserRoute = require('./routes/createUserRoute');
const surveyReponseRoutes = require('./routes/surveyReponseRoutes');
const surveyRoute = require('./routes/surveyRoutes');
const quartile_scoreRoute = require('./routes/score_quartileRoutes');
const calculenqueteRoutes = require('./routes/calculRoutes');
const organismeRoutes = require('./routes/organismeRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();





// Routes
app.use('/api/users', userRoutes);
app.use('/api/paiement', paiementRoutes);
app.use('/api/calculenquete', calculenqueteRoutes);
app.use('/api/organismes', organismeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quartile_score', quartile_scoreRoute);
app.use('/api/responses', responseRoutes);
app.use('/api/enquete', enqueteRoutes);
app.use('/api/choixreponse', choixreponseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/datanuage', dataNuageRoutes);
app.use('/api/sendInvite', createUserRoute);
app.use('/api/surveys/Reponse', surveyReponseRoutes);
app.use('/api/surveys', surveyRoute);

// Middleware pour les erreurs
app.use(errorMiddleware);

module.exports = app;
