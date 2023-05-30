require('dotenv').config();
const express = require('express');
const app = express();
const moongose = require('mongoose');

moongose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.emit('Pronto')
}).catch((e) => console.log(e));


const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const router = require('./routes');
const path = require('path');
const { middlewareGlobal, CheckCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');
const helmet = require('helmet');
const csrf = require('csurf');

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname,'public')));

const sessionOptions = session({
  secret: 'asdj',
  // store: new MongoStore({ moongoseConnection: mongoose.connection}),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 *7,
    httpOnly: true
  },
  store: MongoStore.create({mongoUrl: process.env.CONNECTIONSTRING})
})

app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());
//NOSSOS PROPRIOS MIDDLEWARES
app.use(middlewareGlobal);
app.use(CheckCsrfError);
app.use(csrfMiddleware)
app.use(router);
app.on('Pronto', () => {
  app.listen(3000, () => {
    console.log('Acessar http://localhost:3000')
    console.log('Servidor executando')
  });
})
