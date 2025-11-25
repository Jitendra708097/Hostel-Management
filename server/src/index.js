const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const connectToDatabase = require('./config/mongoDB');
const menuRouter = require('./routes/menuRouter');
const rulesRouter = require('./routes/rules');
const registrationRouter = require('./routes/registrationFromRoutes');
const mediaRouter = require('./routes/circularRoutes');
const userRouter = require('./routes/userRoutes');
const redisClient = require('./config/redis');
const attendenceRouter = require('./routes/attendenceRoutes');
const circularRouter = require('./routes/circularRoutes')
const leaveRouter = require('./routes/leaveRoutes');
const grievanceRouter = require('./routes/grievanceRouter');
const feeRouter = require('./routes/feesRoutes');
const contactRouter = require('./routes/contactRouter');


app.use(cookieParser());
app.use(express.json());


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


app.use('/menu',menuRouter);
app.use('/rules',rulesRouter);
app.use('/registration',registrationRouter);
app.use('/media', mediaRouter); 
app.use('/user', userRouter); // Assuming you have userRouter defined elsewhere
app.use('/circular',circularRouter);
app.use('/attendance',attendenceRouter);
app.use('/leave',leaveRouter);
app.use('/grievance',grievanceRouter);
app.use('/fees',feeRouter);
app.use('/contact', contactRouter);


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