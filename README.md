# 🎵 Spotify Clone

A full-stack web application mimicking Spotify's functionality, featuring user authentication, song management, and audio playback. Built using Node.js, Express, MySQL, and frontend JavaScript.

## 🚀 Features
- User Authentication (Signup/Login)
- Password Hashing with bcrypt
- Database Interaction with MySQL
- Dynamic Song Management
- Audio Playback
- Responsive Frontend

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js, MySQL, bcrypt
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MySQL

## ⚙️ Prerequisites
- Node.js & npm installed
- MySQL Database
- MySQL Workbench (Optional)

## 🚀 Getting Started
1. Clone the repository:
```bash
git clone https://github.com/your-username/spotify-clone.git
cd spotify-clone
```

2. Install dependencies:
```bash
npm install
```

3. Configure MySQL Database:
- Create a database named `spotify`
- Create a `users` table:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);
```
- Update database credentials in `server.js`.

4. Enter MySQL password in server.js

5. Start the Server:
```bash
node server.js
```
Access the app at [http://localhost:3000](http://localhost:3000) or use live preview at index.html. 

## 🐞 Troubleshooting
- Ensure MySQL server is running.
- Verify database credentials in `server.js`.
- Check console logs for errors.

## 🎉 Future Enhancements
- Playlist management
- Search functionality
- JWT-based Authentication
- Cloud Storage for Songs

## 📝 License
This project is licensed under the MIT License.

