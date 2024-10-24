const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { format } = require('date-fns'); // Import date-fns for date formatting

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.SECRET;

const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

app.use(morgan('combined', { stream: logStream }));
app.use(cors({
  exposedHeaders: ['x-total-count']
}));
app.use(express.json());

// Connect to MongoDB
const mongodbConnectionUrl = process.env.MONGODB_CONNECTION_URL;

const client = new MongoClient(mongodbConnectionUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// MongoDB and Mongoose setup
async function run() {
  try {
    const url = mongodbConnectionUrl + '?retryWrites=true&w=majority&appName=Cluster0';
    mongoose.set('strictQuery', false);
    await mongoose.connect(url);

    // schemas and models
    const noteSchema = new mongoose.Schema({
      id: { type: Number, unique: true, required: true },
      title: { type: String, required: false },
      content: { type: String, required: true },
      author: {
        name: { type: String, required: false },
        email: { type: String, required: false }
      },
      createdAt: { type: Date, default: Date.now, required: true }, // New field
      updatedAt: { type: Date, default: null } // New field
    });

    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      username: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true }
    });

    const Note = mongoose.model('Note', noteSchema);
    const User = mongoose.model('User', userSchema);

    // Middleware to verify token
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.sendStatus(401);

      jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    };

    // Routes
    app.post('/users', async (req, res) => {
      const { name, email, username, password } = req.body;
      if (!name || !email || !username || !password) {
        return res.status(400).json({ message: 'Missing fields in the request' });
      }

      try {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, username, passwordHash });
        const savedUser = await user.save();
        res.status(201).json(savedUser);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/login', async (req, res) => {
      const { username, password } = req.body;
      console.log('Login attempt:', { username, password });
      if (!username || !password) {
        return res.status(400).json({ message: 'Missing fields in the request' });
      }
    
      try {
        const user = await User.findOne({ username });
        console.log('User found:', user);
        const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash);
    
        if (!(user && passwordCorrect)) {
          console.log('Invalid credentials');
          return res.status(401).json({ message: 'Invalid username or password' });
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        };
    
        const token = jwt.sign(userForToken, SECRET);
    
        res.status(200).send({ token, name: user.name, email: user.email });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
      }
    });
    
    app.get('/notes', async (req, res) => {
      try {
        const page = parseInt(req.query._page) || 1;
        const limit = parseInt(req.query._per_page) || 10;
        const notes = await Note.find()
          .skip((page - 1) * limit)
          .limit(limit);
        const totalNotes = await Note.countDocuments();
        
        // Format createdAt and updatedAt fields
        const formattedNotes = notes.map(note => ({
          ...note.toObject(), // Convert mongoose document to plain object
          createdAt: format(note.createdAt, 'MM/dd/yyyy, h:mm:ss a'), // Format for consistency
          updatedAt: note.updatedAt ? format(note.updatedAt, 'MM/dd/yyyy, h:mm:ss a') : null // Format updatedAt
        }));
        
        res.set('x-total-count', totalNotes);
        res.status(200).json(formattedNotes);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/notes/:id', async (req, res) => {
      try {
        const note = await Note.findOne({ id: req.params.id });
        if (note) {
          const formattedNote = {
            ...note.toObject(),
            createdAt: format(note.createdAt, 'MM/dd/yyyy, h:mm:ss a'),
            updatedAt: note.updatedAt ? format(note.updatedAt, 'MM/dd/yyyy, h:mm:ss a') : null
          };
          res.status(200).json(formattedNote);
        } else {
          res.status(404).json({ message: 'Note not found' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.post('/notes', authenticateToken, async (req, res) => {
      const { title, content, author } = req.body;
      if (!content) {
        return res.status(400).json({ message: 'Missing fields in the request' });
      }

      try {
        const highestIdNote = await Note.findOne().sort('-id').exec();
        let idCount = highestIdNote ? highestIdNote.id + 1 : 1;

        const note = new Note({
          id: idCount,
          title,
          content,
          author,
          createdAt: new Date(), // Set createdAt
          updatedAt: null // Initialize updatedAt to null
        });

        const savedNote = await note.save();
        res.status(201).json(savedNote);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.put('/notes/:id', authenticateToken, async (req, res) => {
      console.log('PUT /notes/:id request body:', req.body);
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Note ID is required' });
      }

      const { title, content, author } = req.body;
      if (!content) {
        return res.status(400).json({ message: 'Missing fields in the request' });
      }

      try {
        const updatedNote = await Note.findOneAndUpdate(
          { id: req.params.id },
          { title, content, author, updatedAt: new Date() }, // Update updatedAt
          { new: true, runValidators: true }
        );
        if (updatedNote) {
          const formattedUpdatedNote = {
            ...updatedNote.toObject(),
            createdAt: format(updatedNote.createdAt, 'MM/dd/yyyy, h:mm:ss a'),
            updatedAt: format(updatedNote.updatedAt, 'MM/dd/yyyy, h:mm:ss a')
          };
          res.status(200).json(formattedUpdatedNote);
        } else {
          res.status(404).json({ message: 'Note not found' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.delete('/notes/:id', authenticateToken, async (req, res) => {
      console.log('DELETE /notes/:id request params:', req.params);
      const { id } = req.params;        
      try {
        const deletedNote = await Note.findOneAndDelete({ id: req.params.id });
        if (deletedNote) {
          res.status(204).send();
        } else {
          res.status(404).json({ message: 'Note not found' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.use((req, res) => {
      res.status(404).json({ message: 'Unknown route' });
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
