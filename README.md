# Infinitum Backend  

This is the backend for the **Infinitum Registration Website**. It provides APIs for user authentication, event management, and student-related functionalities.  

---

## Run Using Docker  

1. **Pull the Docker Image**  
   ```bash
   docker pull darshan122205/infinitum-backend:latest
   ```

2. **Run the Docker Container**  
   ```bash
   docker run -p 3000:3000 --env-file .env darshan122205/infinitum-backend:latest
   ```

---

## API Documentation  

### Base URL  
```
http://localhost:3000/api
```

### **Authentication APIs**  
| Method | Endpoint        | Description                              | Headers                | Body Example |
|--------|-----------------|------------------------------------------|------------------------|--------------|
| POST   | `/auth/register` | Register a new student                   | ❌                     | `{ "name": "John Doe", "roll_no": "CS101", "department": "CSE", "year": 3, "phn_no": "9876543210", "password": "securepass" }` |
| POST   | `/auth/login`    | Login using Roll No & Password           | ❌                     | `{ "roll_no": "CS101", "password": "securepass" }` |
| POST   | `/auth/logout`   | Logout the current user                  | ✅ Authorization: Bearer `<token>` | ❌ |

---

### **Student APIs**  
| Method | Endpoint                | Description                           | Headers                | Body Example |
|--------|--------------------------|---------------------------------------|------------------------|--------------|
| GET    | `/student/profile`        | Fetch the logged-in student profile   | ✅ Authorization: Bearer `<token>` | `{}` |
| GET    | `/student/registeredEvents` | Fetch registered events for a student | ✅ Authorization: Bearer `<token>` | `{}` |

---

### **Event APIs**  
| Method | Endpoint            | Description                              | Headers                | Body Example |
|--------|----------------------|------------------------------------------|------------------------|--------------|
| GET    | `/event`             | Fetch all available events               | ❌                     | `{}` |
| POST   | `/event/create`      | Create a new event (Admin only)          | ✅ Authorization: Bearer `<token>` | `{ "event_name": "Tech Summit 2024", "description": { "location": "PSG Tech Auditorium", "date": "2024-06-15", "details": "A conference on the latest technology trends." } }` |
| GET    | `/event/register`    | Register a student for an event          | ✅ Authorization: Bearer `<token>` | `{}` |
| GET    | `/event/fetch/:eventid` | Fetch students registered for an event | ✅ Authorization: Bearer `<token>` | `{}` |

---

