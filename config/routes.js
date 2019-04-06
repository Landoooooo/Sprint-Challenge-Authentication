const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtKey =
  process.env.JWT_SECRET ||
  'add a .env file to root of project with the JWT_SECRET variable';

const Users = require('../users/users=model.js');
const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(user => {
      res.status(201).json(user)
    })
    .catch(e => {
      res.status(500).json(e)
    })
}

function login(req, res) {
  // implement user login
  let {username, password} = req.body;
  Users.findBy({ username })
    .first()
    .then( user => {
      if(user && bcrypt.compareSync(password, user.password)){
        const token = generateToken(user);
        res.status(200).json({
          token,
          message: `You now have access to the worlds best jokes ${user.username}`,
          user
        })
      }else{
        res.status(401).json({message: 'Invalid Credentials'})
      }
    })

  function generateToken(user){
    const payload = {
        subject: user.id,
        username: user.username
    };

    const options = {
        expiresIn: "1d"
    }

    return jwt.sign(payload, jwtKey, options)
  }
}



function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
