# Prism - Intelligent Collaboration Tool

**Prism** is an intelligent collaboration tool designed to prevent merge conflicts for remote development teams using AI-driven coding. Developed by team "Skill Issue" for the "Developer Tools & Cloud Infrastructure" problem statement, it acts as an AI project manager to make "vibe coding" more efficient and less chaotic.

## 🎯 Project Overview

### The Problem

The project addresses a major productivity issue in modern development: AI-assisted coding in remote teams often leads to developers creating conflicting code because they lack a shared context. This results in frequent merge conflicts, which can cost developers up to a full day of work each week, undermining the speed benefits of AI coding assistants.

### The Solution

Prism proposes a system that proactively prevents these conflicts. It uses an "intelligent collaboration hub" that combines a central dashboard with a VS Code extension to maintain a real-time understanding of the entire project's context.

**Core Features:**
- **Proactive Conflict Prevention**: Before a developer begins coding, Prism uses the **Google Gemini API** to analyze the new task against all other ongoing work
- **Real-time Context Sharing**: Maintains a shared understanding of project state across the entire development team
- **AI-Powered Analysis**: Predicts potential merge conflicts and only gives a "green light" for tasks that won't conflict

**Workflow:**
1. A developer inputs their intended task into the VS Code extension
2. This context is sent to the Gemini API, which checks for potential file overlaps with other "in-progress" tasks
3. The developer receives a "Safe to Proceed" or "Conflict Warning" directly in their IDE

## 🛠️ Technology Stack

Prism is built using the **MERN** stack for rapid development:

- **Frontend**: React.js with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **IDE Integration**: VS Code Extension (TypeScript)
- **AI Engine**: Google Gemini API
- **Version Control**: GitHub API integration
- **UI/UX**: Custom glassmorphism design system

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher) - recommended via nvm
- npm or yarn
- MongoDB (local or cloud instance)
- Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amaansyed27/prism.git
   cd prism
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your MongoDB connection string and API keys
   
   # Start the backend server
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the `backend` directory with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prism
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
JWT_SECRET=your_jwt_secret_here
```

## 📁 Project Structure

```
prism/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Express middlewares
│   │   └── services/       # Business logic services
│   └── package.json
└── vscode-extension/        # VS Code extension (coming soon)
```

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm start            # Start server with ts-node
npm run build        # Compile TypeScript
npm run dev          # Start with nodemon (if configured)
```

## 🚀 Deployment

### Frontend
The frontend can be deployed to any static hosting provider:
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after `npm run build`
- **GitHub Pages**: Use GitHub Actions for automated deployment

### Backend
Deploy the backend to:
- **Railway**: Easy Node.js deployment with MongoDB
- **Heroku**: Classic PaaS solution
- **Digital Ocean**: App Platform or Droplets
- **AWS**: EC2, ECS, or Lambda

## 🎨 Design System

Prism features a custom glassmorphism design system with:
- Dark theme with translucent glass panels
- Blur effects and subtle animations
- Inter font family for clean typography
- Blue primary colors with status indicators
- Responsive grid layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team "Skill Issue"

Developed for the "Developer Tools & Cloud Infrastructure" problem statement.

---

**Note**: This project is currently in development. The VS Code extension and full AI integration features are planned for future releases.
