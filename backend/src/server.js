// NJ (Noah) Dollenberg u24596142 41
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../../public')));

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
        email: 'john@example.com',
        password: 'password123',
        name: 'John Developer',
        company: 'Tech Corp',
        country: 'USA',
        birthDate: '1990/01/15'
    },
    {
        id: 2,
        email: 'sarah@example.com',
        password: 'password456',
        name: 'Sarah Coder',
        company: 'StartupXYZ',
        country: 'Canada',
        birthDate: '1992/05/22'
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
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available endpoints:');
    console.log('  POST /api/auth/signup   - User registration');
    console.log('  POST /api/auth/login    - User login');
    console.log('  GET  /api/auth/me       - Get current user');
    console.log('  POST /api/auth/logout   - User logout');
    console.log('  GET  /api/health        - Health check');
});