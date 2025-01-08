import express from 'express';
import cors from 'cors';
import morgan from 'morgan';


import ApiRoutes from './Routes/index.js';
import Config from './Config/serverConfig.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
 
Config.RateLimiter(app);

app.use('/api', ApiRoutes);


app.listen(Config.PORT, () => {
  console.log(`Server is running on http://localhost:${Config.PORT}/`);
});