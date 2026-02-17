# 🎓 Student Validation System - Node.js + Express + MySQL

## Professional Grade Management System - Modern Node.js Edition

A comprehensive, modern web application for managing student grades, validations, and academic records. Built with **Node.js**, **Express**, **MySQL**, and modern JavaScript.

---

## ✨ Features

### Core Functionality
- ✅ **RESTful API**: Clean API architecture
- ✅ **Student ID Generation**: Automatic unique ID generation (Format: STU-XXXXXX)
- ✅ **Student Registration**: Complete inscription system with photo upload
- ✅ **Grade Validation**: Automatic status calculation (Validé/Ratt/NV)
- ✅ **MySQL Integration**: Full database with connection pooling
- ✅ **Real-time Statistics**: Live calculation of success rates
- ✅ **Data Visualization**: Interactive pie charts with Chart.js
- ✅ **Session Management**: Save and retrieve validation sessions
- ✅ **Export Capabilities**: Excel (CSV) and JSON export
- ✅ **Search & Filter**: Search students by name, email, or ID
- ✅ **CRUD Operations**: Complete Create, Read, Update, Delete
- ✅ **File Upload**: Photo management with Multer
- ✅ **Responsive Design**: Works on all devices

### Modern Features
- 🚀 **Async/Await**: Modern promise-based code
- 🔒 **Security**: Input validation, SQL injection protection
- 📊 **Connection Pooling**: Efficient database connections
- 🎨 **EJS Templates**: Server-side rendering
- 📦 **Modular Structure**: Clean code organization
- 🔧 **Environment Variables**: Easy configuration
- 🐛 **Error Handling**: Comprehensive error management
- 📝 **Logging**: Console logging for debugging

---

## 🚀 Installation Guide

### Prerequisites
- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **MySQL**: 5.7 or higher

### Step 1: Extract Files
```bash
# Extract the ZIP file to your desired location
unzip student-validation-system-nodejs.zip
cd student-system-nodejs
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express (Web framework)
- mysql2 (MySQL driver)
- ejs (Template engine)
- multer (File upload)
- dotenv (Environment variables)
- express-session (Session management)
- cors (CORS handling)
- And more...

### Step 3: Create Database
1. **Open MySQL** (phpMyAdmin or command line)
2. **Create database**:
```sql
CREATE DATABASE student_validation_system;
```
3. **Import schema**:
```bash
# From command line
mysql -u root -p student_validation_system < database.sql

# Or import database.sql through phpMyAdmin
```

### Step 4: Configure Environment
1. **Open `.env` file**
2. **Update if needed**:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_validation_system
DB_PORT=3306
```

### Step 5: Start Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### Step 6: Access Application
Open your browser:
```
http://localhost:3000
```

**You're done!** 🎉

---

## 📁 Project Structure

```
student-system-nodejs/
├── server.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment configuration
├── database.sql             # Database schema
│
├── config/
│   └── database.js          # Database connection pool
│
├── routes/
│   ├── students.js          # Student API routes
│   ├── validation.js        # Validation routes
│   └── sessions.js          # Session routes
│
├── views/
│   ├── index.ejs            # Main validation page
│   ├── inscription.ejs      # Registration form
│   ├── students.ejs         # Students list
│   ├── history.ejs          # Session history
│   └── 404.ejs              # Error page
│
└── public/
    ├── css/
    │   └── style.css        # Stylesheet
    ├── js/
    │   └── app.js           # Client-side JavaScript
    └── uploads/
        └── photos/          # Uploaded photos
```

---

## 🎯 API Endpoints

### Students API

#### Get All Students
```http
GET /api/students
Query: ?search=term
Response: { success: true, students: [...] }
```

#### Get Single Student
```http
GET /api/students/:id
Response: { success: true, student: {...} }
```

#### Register Student
```http
POST /api/students
Content-Type: multipart/form-data
Body: { full_name, email, phone, program, photo }
Response: { success: true, student_id: "STU-123456" }
```

#### Update Student
```http
PUT /api/students/:id
Content-Type: application/json
Body: { full_name, email, phone, program }
Response: { success: true, message: "..." }
```

#### Delete Student
```http
DELETE /api/students/:id
Response: { success: true, message: "..." }
```

### Validation API

#### Save Session
```http
POST /api/validation/save-session
Content-Type: application/json
Body: { session_name, students_data: [...] }
Response: { success: true, session_id: 1 }
```

#### Add Grade
```http
POST /api/validation/add-grade
Content-Type: application/json
Body: { student_id, subject, grade }
Response: { success: true, status: "Validé" }
```

#### Get Statistics
```http
GET /api/validation/statistics
Response: { success: true, statistics: {...} }
```

### Sessions API

#### Get All Sessions
```http
GET /api/sessions
Query: ?limit=50
Response: { success: true, sessions: [...] }
```

#### Get Session Details
```http
GET /api/sessions/:id
Response: { success: true, session: {...} }
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
PORT=3000                    # Server port
NODE_ENV=development         # Environment (development/production)

# Database
DB_HOST=localhost            # MySQL host
DB_USER=root                 # MySQL username
DB_PASSWORD=                 # MySQL password
DB_NAME=student_validation_system
DB_PORT=3306                 # MySQL port

# Session
SESSION_SECRET=change-me     # Session secret key

# File Upload
MAX_FILE_SIZE=2097152        # 2MB in bytes
UPLOAD_PATH=./public/uploads/photos
```

### Package.json Scripts

```json
{
  "start": "node server.js",      // Start production server
  "dev": "nodemon server.js"      // Start with auto-reload
}
```

---

## 📊 Database Schema

Same MySQL schema as PHP version:
- `students` - Student information
- `grades` - Individual grades
- `validation_sessions` - Session summaries
- `session_details` - Session student data

---

## 🔒 Security Features

- ✅ **SQL Injection Protection**: Prepared statements with mysql2
- ✅ **XSS Prevention**: Input sanitization and output encoding
- ✅ **File Upload Security**: Type and size validation
- ✅ **Session Security**: Secure session configuration
- ✅ **Error Handling**: No sensitive data in error responses
- ✅ **CORS Protection**: Configurable CORS policies
- ✅ **Environment Variables**: Sensitive data not in code

---

## 🛠️ Development

### Hot Reload Development
```bash
npm run dev
```

Uses `nodemon` to automatically restart on file changes.

### Adding New Routes
1. Create route file in `routes/`
2. Import in `server.js`
3. Mount with `app.use()`

Example:
```javascript
// routes/myroute.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ message: 'Hello' });
});

module.exports = router;

// server.js
const myRoute = require('./routes/myroute');
app.use('/api/myroute', myRoute);
```

---

## 📈 Performance

- ✅ **Connection Pooling**: Reuses database connections
- ✅ **Async Operations**: Non-blocking I/O
- ✅ **Efficient Queries**: Optimized SQL
- ✅ **Static File Serving**: Express static middleware
- ✅ **Error Handling**: Prevents server crashes

---

## 🔄 Comparison with PHP Version

| Feature | PHP Version | Node.js Version |
|---------|-------------|-----------------|
| Server | Apache | Node.js |
| Async | No | Yes ⚡ |
| Real-time | No | Ready for Socket.io |
| API Structure | Mixed | RESTful |
| Performance | Good | Better ⚡ |
| Scalability | Good | Excellent |
| Modern Code | ✓ | ✓✓ |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001

# Or kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Test connection: `mysql -u root -p`

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### File Upload Not Working
- Check `public/uploads/photos/` exists
- Verify folder permissions
- Check MAX_FILE_SIZE in `.env`

---

## 📝 License

MIT License - Open source for educational use

---

## 🎓 Learning Resources

### Node.js
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)

### MySQL
- [mysql2 Package](https://github.com/sidorares/node-mysql2)
- [SQL Tutorial](https://www.w3schools.com/sql/)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [Async/Await Guide](https://javascript.info/async-await)

---

## 🚀 Deployment

### Heroku
```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku create
git push heroku main
```

### DigitalOcean / AWS
1. Upload files to server
2. Install Node.js and MySQL
3. Run `npm install --production`
4. Set environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

## 💻 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database**: MySQL 5.7+ (mysql2 driver)
- **Template Engine**: EJS 3.1
- **File Upload**: Multer 1.4
- **Session**: express-session 1.17
- **Environment**: dotenv 16.3
- **CORS**: cors 2.8

---

## 🎉 What's Next?

Optional enhancements:
- [ ] WebSocket for real-time updates (Socket.io)
- [ ] JWT authentication
- [ ] REST API documentation (Swagger)
- [ ] Unit tests (Jest)
- [ ] TypeScript version
- [ ] GraphQL API
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

** for modern education**
**Version 1.0 - Node.js Edition**

**Happy Coding! 🚀**
#   V I S 2 - F U L L S T A C K 
 
 #   v 2 d a t a v i s 
 
 
