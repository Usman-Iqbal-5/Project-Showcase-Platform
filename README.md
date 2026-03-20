# 🚀 Project Showcase Platform (MSc Dissertation)

A full-stack web application designed to enable students to professionally showcase their academic or personal projects and experiences in a structured, portfolio-ready format.

The platform allows users to create personalised project entries, upload multimedia (images, videos, and documents), highlight skills gained, and demonstrate how their work relates to career goals. Users can also customise how their projects are displayed using pre-designed templates.

---

## 📸 Demo

🎥 Watch the demo:  

### Screenshots

![Homepage](./screenshots/homepage.png)  
![Create Project](./screenshots/create-project.png)  
![Portfolio View](./screenshots/portfolio.png)  

---

## 🧩 Features

- 📝 Create, edit, and delete project/experience entries (full CRUD functionality)  
- 🔐 User authentication system with secure password hashing (bcrypt)  
- 👤 Personal profile section (About Me and personal details)  
- 🧠 Add skills and describe their relevance to career goals  
- 🖼️ Upload and manage images, videos, and files using Cloudinary  
- 🎨 Select from multiple pre-designed display templates  
- ⚠️ Confirmation modals for deleting projects and user accounts (prevents accidental actions)  
- 🔔 Toast notifications for user feedback and actions  

---

## 🛠️ Tech Stack

**Frontend**  
- HTML5  
- CSS3  
- Bootstrap 5 - implementing Template 2 image and video carousels
- JavaScript  

**Backend**  
- Node.js  
- Express.js – handles RESTful routing and server logic 
- EJS (Embedded JavaScript Templates) – server-side rendering of dynamic pages  

**Database**  
- PostgreSQL – relational data storage for students, projects, experiences, media, and tags 

**Authentication & Security**  
- bcrypt – password hashing for secure authentication 

**Cloud Services**  
- Cloudinary – storage and management of images, videos, and files  

---

## 🏗️ Architecture Overview

- Server-side rendered web application using EJS  
- RESTful routing implemented with Express  
- PostgreSQL used for relational data management  
- Cloudinary integration for handling user-uploaded media  
- Authentication system with secure password storage 

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Usman-Iqbal-5/MSc-Dissertation.git
cd project-showcase-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add:

```env
# Session secret for authentication
SESSION_SECRET=your_session_secret

# PostgreSQL database credentials
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=project_showcase
DB_PASSWORD=your_database_password
DB_PORT=5432

# Cloudinary credentials for media storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

### 4. Run the application
```bash
npm start
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 🗄️ Database Design

The application uses PostgreSQL to manage all data for the Project Showcase Platform. The database schema captures the relationships between students, their projects, and experiences, including associated media and skills.  

### Tables

- **student** – Stores student details, including name, email, and securely hashed password.  
- **project** – Contains each project entry created by a student.  
- **project_media** – Holds images, videos, and files associated with projects.  
- **project_tag** – Stores skill tags related to projects.  
- **experience** – Contains each work or learning experience added by a student.  
- **experience_media** – Holds images, videos, and files associated with experiences.  
- **experience_tag** – Stores skill tags related to experiences.  

### Relationships

- Each **student** can have multiple **projects** and **experiences**.  
- Each **project** or **experience** can have multiple **media items** and **tags**.  

The diagram below visually illustrates the schema and relationships:

![Database Schema](./screenshots/db-schema.png)

---

## 🔐 Security Features

- Password hashing using bcrypt  
- Secure user authentication  
- Confirmation modals to prevent accidental deletion of:
  - Projects/experiences  
  - User accounts  
- Basic input validation and handling  

---

## 🎯 Key Learning Outcomes

- Designed and developed a full-stack web application from scratch  
- Implemented secure authentication and password hashing  
- Integrated third-party cloud services for scalable media handling  
- Developed RESTful APIs using Node.js and Express  
- Built dynamic user interfaces using EJS templating  
- Structured and managed relational data using PostgreSQL  
- Improved user experience through modals, toasts, and responsive design  

---

## 🔮 Future Improvements

- 🌐 Deploy the application (e.g. Render or Railway)  
- 🔎 Search and filtering functionality  
- ❤️ Like and comment system for projects  
- 📊 User analytics dashboard  
- 🧑‍💼 Recruiter view mode  
- 🔐 Enhanced authentication (e.g. OAuth / Google login)  

---

## 👨‍💻 Author

Usman Iqbal  
- GitHub: https://github.com/Usman-Iqbal-5

---

## 📄 Licence

This project was developed as part of an MSc Computer Science dissertation and is intended for educational purposes.
