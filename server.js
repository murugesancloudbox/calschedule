require('dotenv').config();
const express = require('express');
const app = express();

// Import your Calendly route file
const calendlyRoutes = require('./routes/calendly');

// Mount it under a base path
app.use('/api/calendly', calendlyRoutes);

// Example: app.use('/api/users', userRoutes);
// Example: app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
