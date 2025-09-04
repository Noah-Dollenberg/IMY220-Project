// NJ (Noah) Dollenberg u24596142 41
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../../frontend/public')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const dummyUsers = [
    {
        id: 1,
        email: 'noah@example.com',
        password: 'password123',
        name: 'Noah Dollenberg',
        company: 'NJD',
        country: 'South Africa',
        birthDate: '2005/09/05'
    },
    {
        id: 2,
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
        company: 'JD Corp',
        country: 'England',
        birthDate: '2000/05/22'
    }
];

const generateToken = (user) => {
    return `token_${user.id}_${Date.now()}`;
};

app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    const existingUser = dummyUsers.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    const newUser = {
        id: dummyUsers.length + 1,
        email,
        password,
        name: 'New User',
        company: '',
        country: '',
        birthDate: '2000/01/01'
    };

    dummyUsers.push(newUser);

    const token = generateToken(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        token,
        user: userWithoutPassword
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    const user = dummyUsers.find(u => u.email === email);
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

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
    });
});

app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No valid token provided'
        });
    }

    const token = authHeader.substring(7);

    const tokenMatch = token.match(/token_(\d+)_/);

    if (!tokenMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    const userId = parseInt(tokenMatch[1]);
    const user = dummyUsers.find(u => u.id === userId);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
        success: true,
        user: userWithoutPassword
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

app.get('/api/projects', (req, res) => {
    res.json({
        success: true,
        message: 'Projects endpoint - to be implemented',
        projects: []
    });
});

app.post('/api/projects', (req, res) => {
    res.json({
        success: true,
        message: 'Create project endpoint - to be implemented'
    });
});

app.get('/api/users/:id', (req, res) => {
    res.json({
        success: true,
        message: 'User profile endpoint - to be implemented'
    });
});

app.put('/api/users/:id', (req, res) => {
    res.json({
        success: true,
        message: 'Update user profile endpoint - to be implemented'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

console.log('Starting server...');
console.log('Routes registered successfully');

app.listen(PORT, () => {
    console.log(`SUCCESS! Server is running on port ${PORT}`);
});