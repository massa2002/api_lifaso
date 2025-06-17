const express = require('express');



const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');


const deliveryRoutes = require('./routes/delivery_requestRoutes');
const createUserRoute = require('./routes/createUserRoute');

const paiementRoutes = require('./routes/paiementRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const retraitRoutes = require('./routes/retraitRoutes');
const app = express();

app.use(express.json());



// Routes
app.use('/api/users', userRoutes);
app.use('/api/wallet', paiementRoutes);
app.use('/api/retrait', retraitRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/delivery-request', deliveryRoutes);


app.use('/api/sendInvite', createUserRoute);

// Middleware pour les erreurs
app.use(errorMiddleware);

module.exports = app;
