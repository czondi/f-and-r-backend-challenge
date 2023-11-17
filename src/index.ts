import express from 'express';
import mongoose from 'mongoose';
import { createHandler } from 'graphql-http/lib/use/express';
import { Schema } from './graphql';

const app = express();
const port = 3000;

const logError = (error: Error) => {
  console.error(error);
};

mongoose
  .connect('mongodb://mongo/test')
  .then(() => {
    console.log('\nConnected to database! 💫\n');

    app.use('/qraphql', createHandler({ schema: Schema }));

    app.get('/', function (req, res) {
      res.sendFile('/app/public/index.html');
    });

    app.listen(port, () => {
      console.log(`\nGraphQL server is running at http://localhost:${port}/qraphql 🚀\n`);
      console.log(`\nOpen GraphiQL at http://localhost:${port} 🤓\n`);
    });
  })
  .catch(logError);

mongoose.connection.on('error', logError);
