import app from './src/app.js';
import connectDB from './src/config/database.js';

connectDB();

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})