// NJ (Noah) Dollenberg u24596142 41
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
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

// file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectId = req.params.id;
        const projectPath = path.join(__dirname, '../uploads', projectId);
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        cb(null, projectPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Serve files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.static(path.join(__dirname, '../frontend/public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

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

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

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

const checkAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
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

        const avatarEmojis = ['🤖', '🦾', '👽', '👻', '💾', '⌨️', '🕹️', '📺', '💽', '💡'];
        const randomAvatar = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];

        const newUser = {
            email,
            password,
            name: 'New User',
            company: '',
            country: '',
            birthDate: '',
            profilePicture: null,
            avatarEmoji: randomAvatar,
            isAdmin: false,
            friends: [],
            friendRequests: { sent: [], received: [] },
            projectInvitations: { sent: [], received: [] },
            projects: [],
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

        // Check if viewing own profile
        const isOwnProfile = req.user._id.toString() === id;

        // Check if users are friends
        const isFriend = user.friends?.some(friendId =>
            friendId.toString() === req.user._id.toString()
        ) || false;

        let responseUser;

        if (isOwnProfile) {
            // Own profile: return all data except password
            const { password: _, ...userWithoutPassword } = user;
            responseUser = userWithoutPassword;
        } else if (isFriend) {
            // Friends: return full profile except password and sensitive arrays
            const { password: _, friendRequests, projectInvitations, ...userWithoutPassword } = user;
            responseUser = userWithoutPassword;
        } else {
            // Not friends: return only name and profile picture
            responseUser = {
                _id: user._id,
                name: user.name,
                profilePicture: user.profilePicture,
                avatarEmoji: user.avatarEmoji,
                createdAt: user.createdAt,
                isFriend: false,
                isRestricted: true
            };
        }

        res.json({
            success: true,
            user: responseUser,
            isFriend,
            isOwnProfile
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

        // Check if user is admin or editing own profile
        const isAdmin = req.user.isAdmin;
        const isOwnProfile = req.user._id.toString() === id;

        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile'
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Prevent non-admins from changing admin status
        if (!req.user.isAdmin) {
            delete updateData.isAdmin;
        }
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

// Delete user account (admin only)
app.delete('/api/users/:id', checkUser, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const userToDelete = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove user from all friends lists
        await db.collection('users').updateMany(
            { friends: new ObjectId(id) },
            { $pull: { friends: new ObjectId(id) } }
        );

        // Remove user from all friend requests
        await db.collection('users').updateMany(
            {},
            {
                $pull: {
                    'friendRequests.sent': new ObjectId(id),
                    'friendRequests.received': new ObjectId(id)
                }
            }
        );

        // Remove user from all project members
        await db.collection('projects').updateMany(
            { members: new ObjectId(id) },
            { $pull: { members: new ObjectId(id) } }
        );

        // Delete projects owned by the user
        const ownedProjects = await db.collection('projects').find({ owner: new ObjectId(id) }).toArray();
        for (const project of ownedProjects) {
            // Delete project folder
            const projectPath = path.join(__dirname, '../uploads', project._id.toString());
            if (fs.existsSync(projectPath)) {
                fs.rmSync(projectPath, { recursive: true, force: true });
            }
            // Delete project activities
            await db.collection('checkins').deleteMany({ projectId: project._id });
        }
        await db.collection('projects').deleteMany({ owner: new ObjectId(id) });

        // Delete all user's activities
        await db.collection('checkins').deleteMany({ userId: new ObjectId(id) });

        // Delete the user
        await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        res.json({
            success: true,
            message: 'User account deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user account'
        });
    }
});

// IMPORTANT: Keep invitations route BEFORE other project routes
app.get('/api/projects/invitations', checkUser, async (req, res) => {
    try {
        const userInvitations = req.user.projectInvitations || { sent: [], received: [] };
        const receivedInvitations = userInvitations.received || [];

        res.json({
            success: true,
            invitations: receivedInvitations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project invitations'
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
        const { name, description, language, version, isPublic, files, image, hashtags } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required'
            });
        }

        // Use provided hashtags or fallback to language
        const projectHashtags = hashtags && hashtags.length > 0
            ? hashtags
            : [language || 'JavaScript'];

        const newProject = {
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
            language: language || 'JavaScript',
            hashtags: projectHashtags,
            type: 'web-application',
            version: version || '1.0.0',
            isPublic: isPublic !== false,
            image: image || null,
            status: 'checked-in',
            checkedOutBy: null,
            files: files || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('projects').insertOne(newProject);

        // Create project folder
        const projectPath = path.join(__dirname, '../uploads', result.insertedId.toString());
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        // Add project to user's projects array
        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $addToSet: { projects: result.insertedId } }
        );

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

app.delete('/api/activity/:id', checkUser, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activity ID format'
            });
        }

        const activity = await db.collection('checkins').findOne({ _id: new ObjectId(id) });
        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found'
            });
        }

        // Check if user has permission to delete (activity owner, project owner, or admin)
        const project = await db.collection('projects').findOne({ _id: activity.projectId });
        const isAdmin = req.user.isAdmin;
        const isActivityOwner = activity.userId.toString() === req.user._id.toString();
        const isProjectOwner = project && project.owner.toString() === req.user._id.toString();

        if (!isAdmin && !isActivityOwner && !isProjectOwner) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this activity'
            });
        }

        await db.collection('checkins').deleteOne({ _id: new ObjectId(id) });

        res.json({
            success: true,
            message: 'Activity deleted successfully'
        });
    } catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting activity'
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

app.post('/api/friends/request', checkUser, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const targetUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.user.friends && req.user.friends.some(friendId => friendId.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: 'Already friends'
            });
        }

        const userRequests = req.user.friendRequests || { sent: [], received: [] };
        const targetRequests = targetUser.friendRequests || { sent: [], received: [] };

        // Check if target user already sent a request to current user (mutual request)
        if (targetRequests.sent.some(id => id.toString() === req.user._id.toString()) ||
            userRequests.received.some(id => id.toString() === userId)) {
            // Mutual friend request - make them friends immediately
            await db.collection('users').updateOne(
                { _id: req.user._id },
                {
                    $pull: { 'friendRequests.received': new ObjectId(userId) },
                    $addToSet: { friends: new ObjectId(userId) }
                }
            );

            await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                {
                    $pull: { 'friendRequests.sent': req.user._id },
                    $addToSet: { friends: req.user._id }
                }
            );

            return res.json({
                success: true,
                message: 'You are now friends!'
            });
        }

        if (userRequests.sent.some(id => id.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: 'Request already sent'
            });
        }

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $addToSet: { 'friendRequests.sent': new ObjectId(userId) } }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { 'friendRequests.received': req.user._id } }
        );

        res.json({
            success: true,
            message: 'Friend request sent'
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

        if (!ObjectId.isValid(requestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        await db.collection('users').updateOne(
            { _id: req.user._id },
            {
                $pull: { 'friendRequests.received': new ObjectId(requestId) },
                $addToSet: { friends: new ObjectId(requestId) }
            }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(requestId) },
            {
                $pull: { 'friendRequests.sent': req.user._id },
                $addToSet: { friends: req.user._id }
            }
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

app.post('/api/friends/decline', checkUser, async (req, res) => {
    try {
        const { requestId } = req.body;

        if (!ObjectId.isValid(requestId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $pull: { 'friendRequests.received': new ObjectId(requestId) } }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(requestId) },
            { $pull: { 'friendRequests.sent': req.user._id } }
        );

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

app.get('/api/friends/requests', checkUser, async (req, res) => {
    try {
        const userRequests = req.user.friendRequests || { sent: [], received: [] };
        const requestIds = userRequests.received || [];

        const requesters = await db.collection('users')
            .find({ _id: { $in: requestIds } })
            .toArray();

        const requests = requesters.map(requester => {
            const { password: _, ...requesterInfo } = requester;
            return {
                _id: requester._id,
                requesterInfo
            };
        });

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

app.delete('/api/friends/:friendId', checkUser, async (req, res) => {
    try {
        const { friendId } = req.params;

        if (!ObjectId.isValid(friendId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid friend ID'
            });
        }

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $pull: { friends: new ObjectId(friendId) } }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(friendId) },
            { $pull: { friends: req.user._id } }
        );

        res.json({
            success: true,
            message: 'Friend removed successfully'
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing friend'
        });
    }
});

app.get('/api/friends/:userId', checkUser, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const friends = await db.collection('users')
            .find({ _id: { $in: user.friends || [] } })
            .toArray();

        const safeFriends = friends.map(friend => {
            const { password: _, ...safeFriend } = friend;
            return safeFriend;
        });

        res.json({
            success: true,
            friends: safeFriends
        });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching friends'
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

// Make sure this comes after the invitations route
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

// Project invitation endpoints
app.post('/api/projects/:id/invite', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project or user ID'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can send invitations'
            });
        }

        const targetUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (project.members.some(member => member.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this project'
            });
        }

        const userInvitations = req.user.projectInvitations || { sent: [], received: [] };
        const targetInvitations = targetUser.projectInvitations || { sent: [], received: [] };

        const invitationExists = userInvitations.sent.some(inv =>
            inv.projectId.toString() === id && inv.userId.toString() === userId
        );

        if (invitationExists) {
            return res.status(400).json({
                success: false,
                message: 'Invitation already sent'
            });
        }

        const invitation = {
            projectId: new ObjectId(id),
            userId: new ObjectId(userId),
            projectName: project.name,
            invitedBy: new ObjectId(req.user._id),
            invitedByName: req.user.name,
            createdAt: new Date()
        };

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $push: { 'projectInvitations.sent': invitation } }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $push: { 'projectInvitations.received': invitation } }
        );

        res.json({
            success: true,
            message: 'Project invitation sent successfully'
        });
    } catch (error) {
        console.error('Send project invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending project invitation'
        });
    }
});

app.post('/api/projects/invitations/accept', checkUser, async (req, res) => {
    try {
        const { projectId, invitedBy } = req.body;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(invitedBy)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project or user ID'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId) },
            { $addToSet: { members: req.user._id } }
        );

        // Add project to user's projects array
        await db.collection('users').updateOne(
            { _id: req.user._id },
            {
                $pull: { 'projectInvitations.received': { projectId: new ObjectId(projectId), invitedBy: new ObjectId(invitedBy) } },
                $addToSet: { projects: new ObjectId(projectId) }
            }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(invitedBy) },
            { $pull: { 'projectInvitations.sent': { projectId: new ObjectId(projectId), userId: req.user._id } } }
        );

        res.json({
            success: true,
            message: 'Project invitation accepted'
        });
    } catch (error) {
        console.error('Accept project invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting project invitation'
        });
    }
});

app.post('/api/projects/invitations/decline', checkUser, async (req, res) => {
    try {
        const { projectId, invitedBy } = req.body;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(invitedBy)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project or user ID'
            });
        }

        await db.collection('users').updateOne(
            { _id: req.user._id },
            { $pull: { 'projectInvitations.received': { projectId: new ObjectId(projectId), invitedBy: new ObjectId(invitedBy) } } }
        );

        await db.collection('users').updateOne(
            { _id: new ObjectId(invitedBy) },
            { $pull: { 'projectInvitations.sent': { projectId: new ObjectId(projectId), userId: req.user._id } } }
        );

        res.json({
            success: true,
            message: 'Project invitation declined'
        });
    } catch (error) {
        console.error('Decline project invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error declining project invitation'
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('TEST ENDPOINT HIT');
    res.json({ success: true, message: 'Server is working' });
});



// Migration endpoint to add missing fields to existing users
app.post('/api/migrate/add-user-fields', async (req, res) => {
    try {
        const projectInvitationsResult = await db.collection('users').updateMany(
            { projectInvitations: { $exists: false } },
            { $set: { projectInvitations: { sent: [], received: [] } } }
        );

        const projectsResult = await db.collection('users').updateMany(
            { projects: { $exists: false } },
            { $set: { projects: [] } }
        );

        res.json({
            success: true,
            message: `Updated ${projectInvitationsResult.modifiedCount} users with projectInvitations field and ${projectsResult.modifiedCount} users with projects field`,
            projectInvitationsUpdated: projectInvitationsResult.modifiedCount,
            projectsUpdated: projectsResult.modifiedCount
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during migration'
        });
    }
});

// Get user's projects
app.get('/api/users/:id/projects', checkUser, async (req, res) => {
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

        const projectIds = user.projects || [];
        const projects = await db.collection('projects')
            .find({ _id: { $in: projectIds } })
            .sort({ updatedAt: -1 })
            .toArray();

        // Add owner info and check if user was removed
        for (let project of projects) {
            const owner = await db.collection('users').findOne({ _id: project.owner });
            if (owner) {
                project.ownerInfo = {
                    _id: owner._id,
                    name: owner.name,
                    email: owner.email
                };
            }

            // Check if user is still a member
            const isStillMember = project.members.some(member => member.toString() === id);
            project.isRemoved = !isStillMember;
        }

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user projects'
        });
    }
});

// Update project details (owner or admin, when checked out)
app.put('/api/projects/:id', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, version } = req.body;

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

        const isAdmin = req.user.isAdmin;
        const isOwner = project.owner.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner or admin can update project details'
            });
        }

        // Admin can edit without checking out, owner must check out
        if (!isAdmin) {
            if (project.status !== 'checked-out' || project.checkedOutBy.toString() !== req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Project must be checked out by you to make changes'
                });
            }
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (version) updateData.version = version;

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating project'
        });
    }
});

// Transfer project ownership (owner only, when checked out)
app.put('/api/projects/:id/transfer-ownership', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwnerId } = req.body;

        if (!ObjectId.isValid(id) || !ObjectId.isValid(newOwnerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project or user ID format'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can transfer ownership'
            });
        }

        if (project.status !== 'checked-out' || project.checkedOutBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to transfer ownership'
            });
        }

        // Check if new owner is a member
        if (!project.members.some(member => member.toString() === newOwnerId)) {
            return res.status(400).json({
                success: false,
                message: 'New owner must be a member of the project'
            });
        }

        // Check if new owner exists
        const newOwner = await db.collection('users').findOne({ _id: new ObjectId(newOwnerId) });
        if (!newOwner) {
            return res.status(404).json({
                success: false,
                message: 'New owner not found'
            });
        }

        // Transfer ownership
        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    owner: new ObjectId(newOwnerId),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: `Ownership transferred to ${newOwner.name}`
        });
    } catch (error) {
        console.error('Transfer ownership error:', error);
        res.status(500).json({
            success: false,
            message: 'Error transferring ownership'
        });
    }
});

// Remove member from project (owner only, when checked out)
app.delete('/api/projects/:id/members/:memberId', checkUser, async (req, res) => {
    try {
        const { id, memberId } = req.params;

        if (!ObjectId.isValid(id) || !ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project or member ID format'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can remove members'
            });
        }

        if (project.status !== 'checked-out' || project.checkedOutBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to remove members'
            });
        }

        if (memberId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove yourself from the project'
            });
        }

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { members: new ObjectId(memberId) } }
        );

        res.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing member'
        });
    }
});

// Add files to project (members only, when checked out)
app.post('/api/projects/:id/files', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { files } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Files array is required'
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

        if (project.status !== 'checked-out' || project.checkedOutBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to add files'
            });
        }

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            {
                $addToSet: { files: { $each: files } },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Files added successfully'
        });
    } catch (error) {
        console.error('Add files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding files'
        });
    }
});

// Remove files from project (members only, when checked out)
app.delete('/api/projects/:id/files', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { files } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Files array is required'
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

        if (project.status !== 'checked-out' || project.checkedOutBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to remove files'
            });
        }

        // Allow file operations during creation or when checked out
        const isJustCreated = new Date() - new Date(project.createdAt) < 60000; // 1 minute after creation
        const isCheckedOutByUser = project.status === 'checked-out' && project.checkedOutBy.toString() === req.user._id.toString();

        if (!isJustCreated && !isCheckedOutByUser) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to remove files'
            });
        }

        // Get file info before removing
        const filesToRemove = project.files.filter(file => {
            if (typeof file === 'string') {
                return files.includes(file);
            }
            return files.includes(file.filename) || files.includes(file.originalName);
        });

        // Remove files from disk
        filesToRemove.forEach(file => {
            if (typeof file === 'object' && file.filename) {
                const filePath = path.join(__dirname, '../uploads', id, file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            {
                $pull: {
                    files: {
                        $or: [
                            { filename: { $in: files } },
                            { originalName: { $in: files } }
                        ]
                    }
                },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Files removed successfully'
        });
    } catch (error) {
        console.error('Remove files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing files'
        });
    }
});

// Add activity/discussion message to project (members only)
app.post('/api/projects/:id/activity', checkUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user is a member
        if (!project.members.some(member => member.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You must be a project member to add activity'
            });
        }

        // Create activity entry
        const activity = {
            projectId: new ObjectId(id),
            userId: req.user._id,
            type: 'discussion',
            message: message.trim(),
            timestamp: new Date()
        };

        await db.collection('checkins').insertOne(activity);

        res.status(201).json({
            success: true,
            message: 'Activity added successfully'
        });
    } catch (error) {
        console.error('Add activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding activity'
        });
    }
});

// Delete project (owner or admin)
app.delete('/api/projects/:id', checkUser, async (req, res) => {
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

        const isAdmin = req.user.isAdmin;
        const isOwner = project.owner.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner or admin can delete the project'
            });
        }

        // Admin can delete anytime, owner must check in first
        if (!isAdmin && project.status !== 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked in to delete'
            });
        }

        // Delete entire project folder
        const projectPath = path.join(__dirname, '../uploads', id);
        if (fs.existsSync(projectPath)) {
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        // Remove project from all users' projects arrays
        await db.collection('users').updateMany(
            { projects: new ObjectId(id) },
            { $pull: { projects: new ObjectId(id) } }
        );

        // Delete project activities
        await db.collection('checkins').deleteMany({ projectId: new ObjectId(id) });

        // Delete the project
        await db.collection('projects').deleteOne({ _id: new ObjectId(id) });

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting project'
        });
    }
});

// Upload files to project
app.post('/api/projects/:id/upload', checkUser, upload.array('files'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
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

        // Allow uploads during creation (when project is just created) or when checked out
        const isJustCreated = new Date() - new Date(project.createdAt) < 60000; // 1 minute after creation
        const isCheckedOutByUser = project.status === 'checked-out' && project.checkedOutBy.toString() === req.user._id.toString();

        if (!isJustCreated && !isCheckedOutByUser) {
            return res.status(400).json({
                success: false,
                message: 'Project must be checked out by you to upload files'
            });
        }

        const fileData = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            uploadedBy: req.user._id,
            uploadedAt: new Date()
        }));

        await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            {
                $push: { files: { $each: fileData } },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            files: fileData
        });
    } catch (error) {
        console.error('Upload files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files'
        });
    }
});

// Download file from project
app.get('/api/projects/:id/files/:filename', checkUser, async (req, res) => {
    try {
        const { id, filename } = req.params;

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
                message: 'You do not have permission to access this project'
            });
        }

        const file = project.files?.find(f => f.filename === filename);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const filePath = path.join(__dirname, '../uploads', id, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on disk'
            });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading file'
        });
    }
});

// Remove project from user's list (for removed participants only)
app.delete('/api/users/:userId/projects/:projectId', checkUser, async (req, res) => {
    try {
        const { userId, projectId } = req.params;

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user or project ID format'
            });
        }

        if (userId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only remove projects from your own list'
            });
        }

        const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user is no longer a member (was removed)
        const isStillMember = project.members.some(member => member.toString() === userId);
        if (isStillMember) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove project - you are still a member'
            });
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { projects: new ObjectId(projectId) } }
        );

        res.json({
            success: true,
            message: 'Project removed from your list'
        });
    } catch (error) {
        console.error('Remove project from user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing project from user list'
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
    res.setHeader('Content-Type', 'text/html');
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