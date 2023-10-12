const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


const app = express();
const port = 4000;
app.use(cookieParser());
app.use(express.static('public'));


// Replace 'your-secret-key' with your own secret key.
const secretKey = 'your-secret-key';

// Sample user data (in a real app, this would come from a database).
const users = [
  {
    id: 1,
    username: 'user',
    hashedPassword: '$2a$12$pP1uxWlr3FVrztn5.KqeeOvFv5PYBtufhTYEHmyJ8aEpeQMN5VFEK', // Hashed version of "password123"
    password:'123',
    role: 'user',
  },
];

// Middleware to parse JSON request bodies.
app.use(bodyParser.json());

app.get('/welcome',verifyToken,(req, res) => {
  // If the token is valid, render the welcome HTML page.
  res.sendFile(__dirname + '/wellcome.html');

}); 
app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/login.html');
});

// Middleware to verify the token.

app.get('/login', (req, res) => {
  // If the token is valid, render the welcome HTML page.
  res.sendFile(__dirname + '/login.html');

});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
    // Find the user by username (in a real app, you would query your database).
    const user = users.find((u) => u.username === username);
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare the provided plain password with the stored hashed password.
    // bcrypt.compare(password, users[0].hashedPassword, (err, result) => {
    bcrypt.compare(password, users[0].hashedPassword, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords' });
      }
      
      if (result) {
        // Passwords match; generate a JWT token.
        const payload = {
          id: users.id,
          username: users.username,
          role: users.role,
        };
  
        let token = jwt.sign(payload, secretKey, { expiresIn: '3s' });
        // res.setHeader('Authorization', `Bearer ${token}`);
        res.cookie('token',token,{
          httpOnly: true,
      })



  
        res.json({ message: 'Login successful', token });
      } else {
        // Passwords do not match.
        res.status(401).json({ message: 'Passwords do not match' });
      }
    });
  });
  
  
  
  app.get('/protected', verifyToken,(req, res) => {
    // If the middleware execution reaches this point, it means the token is valid.
    // You can access the user information from req.user.
    
    res.json({ message: 'Access to the protected route granted', user: req.user });
  });
  
  function verifyToken(req, res, next) {
         const token=req.cookies.token;

    // const token = req.headers.authorization; // Correct
  
    if (!token) {
      console.log('No token provided');
      return res.redirect('/login');

    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.log('Token verification error:', err);
        // return res.status(403).json({ message: 'Invalid token' });

        //mnin mayl9ach mayl9ach token ymhi cokkies

        res.clearCookie('token');
        return res.redirect('/login');
      }
  
      // Store the decoded token in the request object for later use
      req.user = decoded;
  
      next(); // Continue to the protected route
    });
  }
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })