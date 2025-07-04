import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import courseRoutes from "./routes/courseRoutes"
import assignmentRoutes from "./routes/assignmentRoutes"
import gpaRoutes from "./routes/gpaRoutes"
import upcomingAssignmentRoutes from "./routes/upcomingAssignmentRoutes"
import userRoutes from "./routes/userRoutes"

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: ["https://scholarlog.vercel.app", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/courses", courseRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/user", gpaRoutes)
app.use("/api/user", userRoutes)
app.use('/api/upcoming-assignments', upcomingAssignmentRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('ScholarLog API running!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));