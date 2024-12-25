const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors'); // Import CORS
const User = require('./model')
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const UserAuth = require('./user');
const bcrypt = require('bcrypt')


const port = 5000;

const app = express()
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended : true}));

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/userManagement',  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

    app.use(cookieParser());
app.use(session({  
    secret: 'zayn1234'}));

// Middleware to check for admin access based on query parameter
function isAdmin(req, res, next) {
    if (req.query.isAdmin && req.query.isAdmin === 'true') {
        return next();
    } else {
        return res.status(403).send('Not an Admin');
    }
}

app.get('/register', (req,res)=>{
    res.render('register');
})

app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', async (req,res)=>{
    const {username, password} = req.body;
    const userAuth = await UserAuth.findOne({ username })
    const validPassword = await bcrypt.compare(password, userAuth.password)
    if(validPassword){
        req.session.user_id = userAuth._id;
        res.redirect('/secret')
    }else{
        res.redirect('/login')
    }
})

app.post('/logout',(req,res) =>{
    req.session.user_id = null;
    res.redirect('/login');
})

app.get('/', (req,res)=>{
    res.send('home page');
})

app.post('/register',async (req,res)=>{
    const {password, username} = req.body;
        const hash = await bcrypt.hash(password, 12);
        const userAuth = new UserAuth ({
            username,
            password: hash
        })
        await userAuth.save();
        req.session.user_id = userAuth._id;
        res.redirect('/')
})

app.get('/secret',(req,res)=>{
    if(!req.session.user_id){
       return res.redirect('/login')
    }

    res.render('secret');

})

// Route to check the admin status (testing purpose)
app.get('/admin', isAdmin, (req, res) => {
    res.send('Welcome Admin');
});



// Route to count views using sessions
app.get('/view-count', (req, res) => {
    if (!req.session.viewCount) {
        req.session.viewCount = 0;  // Initialize viewCount if it's not set
    }
    req.session.viewCount++;  // Increment the view count
    res.send(`You have visited this page ${req.session.viewCount} times.`);
});

// Route to test cookie setting and retrieving




app.get('/set-session-cookie', (req, res) => {
  // Set session data
  req.session.user = {
    name: 'Zain Abbas ',
    role: 'Developer',
  };
  req.session.visited = req.session.visited ? req.session.visited + 1 : 1;

  // Set a cookie
  res.cookie('myCookie', 'custom value : 1234', {
    maxAge: 1000 * 60 * 60,  // Cookie duration (1 hour)
    httpOnly: true,          // Prevent access by client-side JavaScript
    secure: false,           // Set to true if using HTTPS
  });

  res.status(200).json({
    message: 'Session and cookie set successfully',
    sessionData: req.session,
  });
});

app.get('/get-session-cookie', (req, res) => {
  // Retrieve session data
  const sessionData = req.session.user || 'No session data found';
  const visited = req.session.visited || 0;

  // Retrieve cookie data
  const cookieData = req.cookies.myCookie || 'No cookie found';

  res.status(200).json({
    session: sessionData,
    visitedCount: visited,
    cookie: cookieData,
  });
});

app.get('/destroy-session-cookie', (req, res) => {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Failed to destroy session' });
      }
      // Clear the session cookie
      res.clearCookie('connect.sid'); 
      // Clear the custom cookie
      res.clearCookie('customCookie');
      res.status(200).json({ message: 'Session and cookies cleared successfully' });
    });
  });



app.post('/users', async (req, res) => {
    try {
        const user = new User({ name: req.body.name });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Read all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read a single user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send({ message: 'User not found' });
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).send({ message: 'User not found' });
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ message: 'User not found' });
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
