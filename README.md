# Employee Feedback Platform

## Tech Stack
- **Frontend**: React 18 (Hooks, Lazy Loading)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)

---

## 🚀 Setup & Run

### 1. Backend
```bash
cd backend
npm install
# Add your MongoDB URI in .env
npm run dev       # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start         # runs on http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint                          | Description                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | /api/employees                    | Create employee                     |
| GET    | /api/employees                    | Get all employees                   |
| POST   | /api/feedback                     | Submit feedback                     |
| GET    | /api/feedback/received/:id        | Get feedback received by employee   |
| GET    | /api/feedback/average/:id         | Get average rating of employee      |
| DELETE | /api/feedback/:feedbackId         | Delete feedback (giver only)        |

---

## ✅ Business Rules
- **No self-feedback**: Cannot give feedback to yourself
- **24hr duplicate prevention**: Cannot give feedback to same person within 24 hours
- **Delete protection**: Only the person who gave the feedback can delete it

## ⭐ Bonus Features
- **Debounced search** (400ms) on employee list
- **Memoized** sorted feedback list with `useMemo`
- **Lazy loaded** components with React `lazy` + `Suspense`
