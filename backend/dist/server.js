"use strict";

var _excluded = ["password"],
  _excluded2 = ["password"],
  _excluded3 = ["password"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
// NJ (Noah) Dollenberg u24596142 41
var express = require('express');
var path = require('path');
var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"](path.join(__dirname, '../../frontend/public')));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
var dummyUsers = [{
  id: 1,
  email: 'noah@example.com',
  password: 'password123',
  name: 'Noah Dollenberg',
  company: 'NJD',
  country: 'South Africa',
  birthDate: '2005/09/05'
}, {
  id: 2,
  email: 'john@example.com',
  password: 'password123',
  name: 'John Doe',
  company: 'JD Corp',
  country: 'England',
  birthDate: '2000/05/22'
}];
var generateToken = function generateToken(user) {
  return "token_".concat(user.id, "_").concat(Date.now());
};
app.post('/api/auth/signup', function (req, res) {
  var _req$body = req.body,
    email = _req$body.email,
    password = _req$body.password;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  var existingUser = dummyUsers.find(function (user) {
    return user.email === email;
  });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email'
    });
  }
  var newUser = {
    id: dummyUsers.length + 1,
    email: email,
    password: password,
    name: 'New User',
    company: '',
    country: '',
    birthDate: '2000/01/01'
  };
  dummyUsers.push(newUser);
  var token = generateToken(newUser);
  var _ = newUser.password,
    userWithoutPassword = _objectWithoutProperties(newUser, _excluded);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    token: token,
    user: userWithoutPassword
  });
});
app.post('/api/auth/login', function (req, res) {
  var _req$body2 = req.body,
    email = _req$body2.email,
    password = _req$body2.password;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  var user = dummyUsers.find(function (u) {
    return u.email === email;
  });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  var token = generateToken(user);
  var _ = user.password,
    userWithoutPassword = _objectWithoutProperties(user, _excluded2);
  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: userWithoutPassword
  });
});
app.get('/api/auth/me', function (req, res) {
  var authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No valid token provided'
    });
  }
  var token = authHeader.substring(7);
  var tokenMatch = token.match(/token_(\d+)_/);
  if (!tokenMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  var userId = parseInt(tokenMatch[1]);
  var user = dummyUsers.find(function (u) {
    return u.id === userId;
  });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }
  var _ = user.password,
    userWithoutPassword = _objectWithoutProperties(user, _excluded3);
  res.json({
    success: true,
    user: userWithoutPassword
  });
});
app.post('/api/auth/logout', function (req, res) {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});
app.get('/api/projects', function (req, res) {
  res.json({
    success: true,
    message: 'Projects endpoint - to be implemented',
    projects: []
  });
});
app.post('/api/projects', function (req, res) {
  res.json({
    success: true,
    message: 'Create project endpoint - to be implemented'
  });
});
app.get('/api/users/:id', function (req, res) {
  res.json({
    success: true,
    message: 'User profile endpoint - to be implemented'
  });
});
app.put('/api/users/:id', function (req, res) {
  res.json({
    success: true,
    message: 'Update user profile endpoint - to be implemented'
  });
});
app.get('/api/health', function (req, res) {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});
app.use(function (err, req, res, next) {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});
console.log('Starting server...');
console.log('Routes registered successfully');
app.listen(PORT, function () {
  console.log("SUCCESS! Server is running on port ".concat(PORT));
});
