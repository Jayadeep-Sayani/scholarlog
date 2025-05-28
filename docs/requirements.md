# ScholarLog – Technical Requirements

## 1. User Management

### Backend
- Register (email, password)
- Login (email, password)
- Auth middleware (JWT)
- Password hashing (bcrypt)

### Frontend
- Login & Register pages
- Form validation
- Auth state management

---

## 2. Courses

### Database Fields
- id
- user_id (foreign key)
- course_name
- course_code (optional)
- is_active (boolean)
- final_grade (optional for completed)

### API Endpoints
- `GET /courses` – list courses (active/completed)
- `POST /courses` – create new course
- `PUT /courses/:id` – update course
- `DELETE /courses/:id` – delete course

---

## 3. Assignments

### Database Fields
- id
- course_id (foreign key)
- title
- grade_received (as %)
- weight (decimal)
- date_due (optional)

### API Endpoints
- `GET /courses/:courseId/assignments`
- `POST /courses/:courseId/assignments`
- `PUT /assignments/:id`
- `DELETE /assignments/:id`

---

## 4. GPA Calculation

### Logic
- Weighted average per course
- GPA = ∑ (course GPA × credit) / ∑ credits
- Allow user-defined grading scale

### Example Scale (4.0):
| Grade | GPA |
|-------|-----|
| A (90-100) | 4.0 |
| B (80-89)  | 3.0 |
| C (70-79)  | 2.0 |
| D (60-69)  | 1.0 |
| F (<60)    | 0.0 |

---

## 5. GPA Analytics

- Store historical GPA per term/user
- Track GPA over time
- Render graph with Recharts/Chart.js

---

## 6. Dashboard UI

### Tabs
- Active Courses
- Completed Courses
- All Courses

### Features
- Sort by name/date
- Search by name
- Filter by status

---

## 7. Settings

- GPA scale preference (4.0 or 10.0)
- Profile management (optional)

---

## 8. Tech Stack Summary

- **Frontend:** React / React Native
- **Backend:** Node.js + Express (or NestJS)
- **DB:** PostgreSQL + Prisma
- **Auth:** JWT
- **Charts:** Chart.js / Recharts

---

## 9. Stretch Goals

- Notifications for due assignments
- Report card export (PDF)
- Multi-user collaboration (e.g., advisor view)
