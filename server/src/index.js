const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const connectToDatabase = require('./config/mongoDB');
const menuRouter = require('./routes/menuRoutes');
const rulesRouter = require('./routes/rulesRoutes');
const registrationRouter = require('./routes/registrationFormRoutes');
const mediaRouter = require('./routes/circularRoutes');
const userRouter = require('./routes/userRoutes');
const redisClient = require('./config/redis');
const attendanceRouter = require('./routes/attendanceRoutes');
const circularRouter = require('./routes/circularRoutes')
const leaveRouter = require('./routes/leaveRoutes');
const grievanceRouter = require('./routes/grievanceRouter');
const feeRouter = require('./routes/feesRoutes');


app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",      // Your local React/Vite frontend
  "http://13.127.163.95",       // Your AWS Production IP
  "http://hrithostel.xyz",
  "https://hrithostel.xyz",
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS configuration 
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

const registerRoutes = (prefix = '') => {
    app.use(`${prefix}/menu`,menuRouter);
    app.use(`${prefix}/rules`,rulesRouter);
    app.use(`${prefix}/registration`,registrationRouter);
    app.use(`${prefix}/media`, mediaRouter); 
    app.use(`${prefix}/user`, userRouter); // Assuming you have userRouter defined elsewhere
    app.use(`${prefix}/circular`,circularRouter);
    app.use(`${prefix}/attendance`,attendanceRouter);
    app.use(`${prefix}/leave`,leaveRouter);
    app.use(`${prefix}/grievance`,grievanceRouter);
    app.use(`${prefix}/fees`,feeRouter);
};

registerRoutes();
registerRoutes('/api');


const startServer = async() => {

    try{ 

        await connectToDatabase();
        console.log('Connected to MongoDB');

         redisClient.connect();
        console.log('Connected to Redis');

        app.listen(process.env.PORT_NUMBER, () => {
        console.log(`Server is running on port ${process.env.PORT_NUMBER}`);

        
    });

    } catch (error) {
        console.error('Error starting server:', error);
    }
}

startServer();
