const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const connectToDatabase = require('./config/mongoDB');
const menuRouter = require('./routes/menuRouter');
const rulesRouter = require('./routes/rules');
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
  "http://13.233.230.164"       // Your AWS Production IP
];

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


app.use('/menu',menuRouter);
app.use('/rules',rulesRouter);
app.use('/registration',registrationRouter);
app.use('/media', mediaRouter); 
app.use('/user', userRouter); // Assuming you have userRouter defined elsewhere
app.use('/circular',circularRouter);
app.use('/attendance',attendanceRouter);
app.use('/leave',leaveRouter);
app.use('/grievance',grievanceRouter);
app.use('/fees',feeRouter);


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