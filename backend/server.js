// NJ (Noah) Dollenberg u24596142 41
const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb+srv://NJDollenberg:yy1oc80ws1Mg7ugH@imy220-project.esoqdrz.mongodb.net/imy220_project?retryWrites=true&w=majority&appName=imy220-project';
let db;

MongoClient.connect(MONGODB_URI)
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('imy220_project');
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, '../frontend/public')));

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

const checkUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No valid token provided'
            });
        }

        const token = authHeader.substring(7);
        const tokenMatch = token.match(/token_(\w+)_/);

        if (!tokenMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const userId = tokenMatch[1];
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

const createToken = (user) => {
    return `token_${user._id}_${Date.now()}`;
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const newUser = {
            email,
            password,
            name: 'New User',
            company: '',
            country: '',
            birthDate: '',
            profilePicture: null,
            friends: [],
            friendRequests: { sent: [], received: [] },
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const user = await db.collection('users').findOne({ _id: result.insertedId });

        const token = createToken(user);
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await db.collection('users').findOne({ email });
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

        const token = createToken(user);
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

app.get('/api/auth/me', checkUser, (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
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

app.get('/api/users', checkUser, async (req, res) => {
    try {
        const users = await db.collection('users').find({}).toArray();
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            users: usersWithoutPasswords
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

app.get('/api/users/search', checkUser, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const searchRegex = new RegExp(q.trim(), 'i');
        const users = await db.collection('users').find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }).limit(20).toArray();

        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            users: usersWithoutPasswords
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users'
        });
    }
});

app.get('/api/users/:id/picture', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: { profilePicture: 1 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            profilePicture: user.profilePicture || null
        });
    } catch (error) {
        console.error('Get user picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user picture'
        });
    }
});

app.get('/api/users/:id', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});

app.put('/api/users/:id', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        if (req.user._id.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile'
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        delete updateData.password;
        delete updateData._id;

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

app.get('/api/projects', checkUser, async (req, res) => {
    try {
        const projects = await db.collection('projects')
            .find({ $or: [{ isPublic: true }, { members: req.user._id }] })
            .sort({ updatedAt: -1 })
            .toArray();

        for (let project of projects) {
            const owner = await db.collection('users').findOne({ _id: project.owner });
            if (owner) {
                project.ownerInfo = {
                    _id: owner._id,
                    name: owner.name,
                    email: owner.email
                };
            }
        }

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
});

app.post('/api/projects', checkUser, async (req, res) => {
    try {
        const { name, description, language, version, isPublic, files } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required'
            });
        }

        const newProject = {
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
            language: language || 'JavaScript',
            hashtags: [language || 'JavaScript'],
            type: 'web-application',
            version: version || '1.0.0',
            isPublic: isPublic !== false,
            image: null,
            status: 'checked-in',
            checkedOutBy: null,
            files: files || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('projects').insertOne(newProject);

        const checkIn = {
            projectId: result.insertedId,
            userId: req.user._id,
            type: 'check-in',
            message: 'Initial project creation',
            version: version || '1.0.0',
            filesAdded: files || [],
            timestamp: new Date()
        };

        await db.collection('checkins').insertOne(checkIn);

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            projectId: result.insertedId
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating project'
        });
    }
});

app.get('/api/activity/:feedType', checkUser, async (req, res) => {
    try {
        const { feedType } = req.params;

        let query = {};
        if (feedType === 'local') {
            const userProjects = await db.collection('projects')
                .find({ members: req.user._id })
                .toArray();

            const projectIds = userProjects.map(p => p._id);
            query = { projectId: { $in: projectIds } };
        }

        const activities = await db.collection('checkins')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

        for (let activity of activities) {
            const user = await db.collection('users').findOne({ _id: activity.userId });
            const project = await db.collection('projects').findOne({ _id: activity.projectId });

            if (user) {
                activity.userInfo = {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                };
            }

            if (project) {
                activity.projectInfo = {
                    _id: project._id,
                    name: project.name,
                    description: project.description,
                    status: project.status
                };
            }
        }

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity'
        });
    }
});

app.post('/api/projects/:id/checkout', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }
        
        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.members.some(member => member.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this project'
            });
        }

        if (project.status === 'checked-out') {
            return res.status(400).json({
                success: false,
                message: 'Project is already checked out'
            });
        }

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'checked-out',
                    checkedOutBy: req.user._id,
                    updatedAt: new Date()
                }
            }
        );

        const checkOut = {
            projectId: new ObjectId(id),
            userId: req.user._id,
            type: 'check-out',
            message: 'Project checked out for editing',
            version: project.version,
            filesAdded: [],
            timestamp: new Date()
        };

        await db.collection('checkins').insertOne(checkOut);

        res.json({
            success: true,
            message: 'Project checked out successfully'
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking out project'
        });
    }
});

app.post('/api/projects/:id/checkin', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { message, version, files } = req.body;

        if (!message || !version) {
            return res.status(400).json({
                success: false,
                message: 'Check-in message and version are required'
            });
        }
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.checkedOutBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only check in projects you checked out'
            });
        }

        const updateData = {
            status: 'checked-in',
            checkedOutBy: null,
            version: version,
            updatedAt: new Date()
        };

        if (files && files.length > 0) {
            updateData.files = [...(project.files || []), ...files];
        }

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        const checkIn = {
            projectId: new ObjectId(id),
            userId: req.user._id,
            type: 'check-in',
            message: message,
            version: version,
            filesAdded: files || [],
            timestamp: new Date()
        };

        await db.collection('checkins').insertOne(checkIn);

        res.json({
            success: true,
            message: 'Project checked in successfully'
        });
    } catch (error) {
        console.error('Checkin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking in project'
        });
    }
});

app.post('/api/friends/decline', checkUser, async (req, res) => {
    try {
        const { requestId } = req.body;
        
        if (!ObjectId.isValid(requestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID format'
            });
        }

        await db.collection('friendRequests').deleteOne({ _id: new ObjectId(requestId) });

        res.json({
            success: true,
            message: 'Friend request declined'
        });
    } catch (error) {
        console.error('Decline friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error declining friend request'
        });
    }
});

app.post('/api/friends/request', checkUser, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot send a friend request to yourself'
            });
        }

        const targetUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.user.friends.some(friendId => friendId.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already friends with this user'
            });
        }

        const existingRequest = await db.collection('friendships').findOne({
            $or: [
                { requester: req.user._id, recipient: new ObjectId(userId) },
                { requester: new ObjectId(userId), recipient: req.user._id }
            ],
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Friend request already exists'
            });
        }

        const friendRequest = {
            requester: req.user._id,
            recipient: new ObjectId(userId),
            status: 'pending',
            createdAt: new Date()
        };

        await db.collection('friendships').insertOne(friendRequest);

        res.json({
            success: true,
            message: 'Friend request sent successfully'
        });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending friend request'
        });
    }
});

app.post('/api/friends/accept', checkUser, async (req, res) => {
    try {
        const { requestId } = req.body;

        const friendship = await db.collection('friendships').findOne({
            _id: new ObjectId(requestId),
            recipient: req.user._id,
            status: 'pending'
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        await db.collection('friendships').updateOne(
            { _id: new ObjectId(requestId) },
            { $set: { status: 'accepted' } }
        );

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $addToSet: { friends: friendship.requester } }
        );

        await db.collection('users').updateOne(
            { _id: friendship.requester },
            { $addToSet: { friends: req.user._id } }
        );

        res.json({
            success: true,
            message: 'Friend request accepted'
        });
    } catch (error) {
        console.error('Accept friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting friend request'
        });
    }
});

app.get('/api/friends/requests', checkUser, async (req, res) => {
    try {
        const requests = await db.collection('friendships')
            .find({
                recipient: req.user._id,
                status: 'pending'
            })
            .toArray();

        for (let request of requests) {
            const requester = await db.collection('users').findOne({ _id: request.requester });
            if (requester) {
                const { password: _, ...requesterInfo } = requester;
                request.requesterInfo = requesterInfo;
            }
        }

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching friend requests'
        });
    }
});

app.get('/api/search/users', checkUser, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                users: []
            });
        }

        const searchRegex = new RegExp(q, 'i');
        const users = await db.collection('users')
            .find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ],
                _id: { $ne: req.user._id }
            })
            .limit(10)
            .toArray();

        const safeUsers = users.map(user => {
            const { password: _, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            success: true,
            users: safeUsers
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users'
        });
    }
});

app.get('/api/search/projects', checkUser, async (req, res) => {
    try {
        const { q, type, hashtag } = req.query;

        let searchQuery = {
            $or: [
                { isPublic: true },
                { members: req.user._id }
            ]
        };

        if (q && q.length >= 2) {
            const searchRegex = new RegExp(q, 'i');
            searchQuery.$and = [
                searchQuery,
                {
                    $or: [
                        { name: searchRegex },
                        { description: searchRegex }
                    ]
                }
            ];
        }

        if (type) {
            searchQuery.type = type;
        }

        if (hashtag) {
            searchQuery.hashtags = hashtag;
        }

        const projects = await db.collection('projects')
            .find(searchQuery)
            .limit(20)
            .toArray();

        for (let project of projects) {
            const owner = await db.collection('users').findOne({ _id: project.owner });
            if (owner) {
                project.ownerInfo = {
                    _id: owner._id,
                    name: owner.name,
                    email: owner.email
                };
            }
        }

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Search projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching projects'
        });
    }
});

app.get('/api/projects/:id', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }
        
        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.isPublic && !project.members.some(member => member.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this project'
            });
        }

        const owner = await db.collection('users').findOne({ _id: project.owner });
        if (owner) {
            const { password: _, ...ownerInfo } = owner;
            project.ownerInfo = ownerInfo;
        }

        const members = await db.collection('users')
            .find({ _id: { $in: project.members } })
            .toArray();

        project.memberInfo = members.map(member => {
            const { password: _, ...memberInfo } = member;
            return memberInfo;
        });

        const recentActivity = await db.collection('checkins')
            .find({ projectId: project._id })
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();

        for (let activity of recentActivity) {
            const user = await db.collection('users').findOne({ _id: activity.userId });
            if (user) {
                const { password: _, ...userInfo } = user;
                activity.userInfo = userInfo;
            }
        }

        project.recentActivity = recentActivity;

        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: db ? 'Connected' : 'Disconnected'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
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