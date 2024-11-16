const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON data
app.use('/public', express.static('uploads')); 

// Connect to MongoDB 
mongoose.connect('mongodb+srv://faisalirfan2502:3LxgNMpUqMrkCvFL@cluster0.x6qkv.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Define the employee schema
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  designation: String,
  mobile: String,
  gender: String,
  courses: [String],
  image: String,
});

// Employee model
const Employee = mongoose.model('Employee', employeeSchema);

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Creating employee
app.post('/employees', upload.single('image'), async (req, res) => {
  try {
    const { name, email, designation, mobile, gender, courses } = req.body;
    const imagePath = req.file.filename;

    const employee = new Employee({
      name,
      email,
      designation,
      mobile,
      gender,
      courses,
      image: imagePath
    });

    await employee.save();
    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error creating employee', error });
    }
  }
});

// return all employees
app.get('/get_employees', async (req, res) => {
  console.log(" fetching ,,,,,,,,,,,,,,,,,,,,,,,,,,");
  
  try {
    const employees = await Employee.find();
    console.log(employees);
    
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ message: 'Error retrieving employees', error });
  }
});

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
