# RewardX API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "employee"
}
```
**Roles:** `employee`, `manager`, `admin`

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "objectId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

---

### Login User
```
POST /auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "objectId",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "employee"
  }
}
```

---

### Logout User
```
POST /auth/logout
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👥 Employee Endpoints

### Get All Employees
```
GET /employees
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):**
```json
[
  {
    "_id": "objectId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Engineering",
    "position": "Senior Developer",
    "rewardPoints": 450,
    "badges": ["badge_id_1", "badge_id_2"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Employee by ID
```
GET /employees/:id
```
**Parameters:**
- `id` (path): Employee ID (ObjectId)

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Single employee object

---

### Update Employee
```
PUT /employees/:id
```
**Parameters:**
- `id` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "name": "John Doe Updated",
  "department": "Product",
  "position": "Senior Engineer"
}
```

**Response (200):**
```json
{
  "message": "Employee updated",
  "employee": { /* updated employee object */ }
}
```

---

### Delete Employee
```
DELETE /employees/:id
```
**Parameters:**
- `id` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Employee deleted"
}
```

---

## 🏆 Reward Endpoints

### Create Reward
```
POST /rewards
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "employeeId": "objectId",
  "points": 100,
  "reason": "Excellent performance on project X",
  "category": "performance"
}
```
**Categories:** `performance`, `attendance`, `innovation`, `teamwork`, `general`

**Response (201):**
```json
{
  "message": "Reward created",
  "reward": {
    "_id": "objectId",
    "employeeId": "objectId",
    "points": 100,
    "reason": "Excellent performance on project X",
    "category": "performance",
    "awardedBy": "objectId",
    "awardedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get All Rewards
```
GET /rewards
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Query Parameters (Optional):**
- `employeeId`: Filter by employee
- `category`: Filter by category

**Response (200):** Array of reward objects

---

### Get Rewards by Employee
```
GET /rewards/employee/:employeeId
```
**Parameters:**
- `employeeId` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Array of rewards for specific employee

---

### Delete Reward
```
DELETE /rewards/:id
```
**Parameters:**
- `id` (path): Reward ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Reward deleted"
}
```

---

## 📅 Attendance Endpoints

### Record Attendance
```
POST /attendance
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "employeeId": "objectId",
  "status": "present",
  "date": "2024-01-15T00:00:00Z",
  "checkInTime": "09:00 AM",
  "checkOutTime": "05:30 PM"
}
```
**Status Options:** `present`, `absent`, `late`, `on-leave`, `work-from-home`

**Response (201):** Attendance record

---

### Get Employee Attendance
```
GET /attendance/employee/:employeeId
```
**Parameters:**
- `employeeId` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Array of attendance records for employee

---

### Get Attendance Report
```
GET /attendance/report
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Query Parameters (Optional):**
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

**Response (200):** Filtered attendance records

---

## 📊 Performance Endpoints

### Create Performance Review
```
POST /performance
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "employeeId": "objectId",
  "rating": 4.5,
  "feedback": "Excellent work this quarter",
  "category": "quarterly"
}
```
**Rating:** 1-5
**Categories:** `quarterly`, `annual`, `project`, `general`

**Response (201):** Performance review object

---

### Get All Performance Reviews
```
GET /performance
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Array of performance reviews

---

### Get Employee Performance
```
GET /performance/employee/:employeeId
```
**Parameters:**
- `employeeId` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Performance reviews for employee

---

### Update Performance Review
```
PUT /performance/:id
```
**Parameters:**
- `id` (path): Performance review ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "rating": 4.7,
  "feedback": "Updated feedback"
}
```

**Response (200):** Updated performance review

---

## 💬 Feedback Endpoints

### Submit Feedback
```
POST /feedback
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "recipientId": "objectId",
  "rating": 5,
  "comment": "Great collaboration on the project",
  "category": "collaboration",
  "isAnonymous": false
}
```
**Rating:** 1-5
**Categories:** `collaboration`, `communication`, `leadership`, `technical`, `general`

**Response (201):** Feedback object

---

### Get Feedback for Employee
```
GET /feedback/employee/:employeeId
```
**Parameters:**
- `employeeId` (path): Employee ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Feedback received by employee

---

### Get All Feedback
```
GET /feedback
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** All feedback in the system

---

## 🎖️ Badge Endpoints

### Create Badge
```
POST /badges
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "name": "Super Achiever",
  "description": "Achieved outstanding results",
  "icon": "star",
  "criteria": "Reach 1000+ reward points",
  "color": "#FFD700"
}
```

**Response (201):** Badge object

---

### Get All Badges
```
GET /badges
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):** Array of all badges

---

### Award Badge to Employee
```
POST /badges/award
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Body:**
```json
{
  "employeeId": "objectId",
  "badgeId": "objectId"
}
```

**Response (200):**
```json
{
  "message": "Badge awarded",
  "user": { /* updated user object */ }
}
```

---

### Delete Badge
```
DELETE /badges/:id
```
**Parameters:**
- `id` (path): Badge ID

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Badge deleted"
}
```

---

## 🏥 Health Check

### Server Health
```
GET /health
```

**Response (200):**
```json
{
  "message": "Server is running"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided" or "Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "status": 500,
  "message": "Internal Server Error"
}
```

---

## 📝 cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "employee"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Employees
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Reward
```bash
curl -X POST http://localhost:5000/api/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "points": 100,
    "reason": "Great work",
    "category": "performance"
  }'
```

---

## 🧪 Testing with Postman

1. Import the API collection
2. Set up environment variables:
   - `BASE_URL`: http://localhost:5000/api
   - `TOKEN`: JWT token from login
3. Use pre-request scripts to automatically update token
4. Test endpoints in sequence

---

**API Version**: 1.0.0
**Last Updated**: May 2026
