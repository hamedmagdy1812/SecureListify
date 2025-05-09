# SecureListify

A production-grade security checklist generator for system hardening and security auditing.

## Overview

SecureListify is a dynamic security checklist generator tailored for various system types (Linux servers, Docker containers, cloud applications, etc.). It helps security professionals and system administrators create, manage, and track security checklists for their systems.

## Features

- **Checklist Generator Engine**: Generate tailored security checklists for various system types
  - Predefined system types (Web App, Linux Server, Docker, Kubernetes, AWS EC2)
  - Modular YAML/JSON templates
  - Each checklist item includes title, description, risk rating, and reference links

- **User Interaction & Customization**
  - Select, edit, or reorder checklist items
  - Progress tracking (Not Started, In Progress, Done, Not Applicable)
  - Drag-and-drop UI for rearranging items

- **Export and Integration**
  - Export options: PDF, Markdown, and JSON
  - Generate audit reports with timestamps and completion status

- **User Accounts & Collaboration**
  - User login and authentication (JWT-based)
  - Save, reload, or share checklists
  - Multi-user collaboration with permissions

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with TailwindCSS
- **Database**: MongoDB
- **Authentication**: JWT-based auth

## Project Structure

```
.
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable UI components
│       ├── contexts/       # React contexts
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Page layouts
│       ├── pages/          # Page components
│       └── utils/          # Utility functions
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    └── src/                # Server source code
        ├── controllers/    # Route controllers
        ├── middlewares/    # Express middlewares
        ├── models/         # Mongoose models
        ├── routes/         # API routes
        ├── services/       # Business logic
        ├── templates/      # Security templates
        └── utils/          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/securelistify.git
   cd securelistify
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Install frontend dependencies
   ```
   cd client
   npm install
   ```

4. Set up environment variables
   - Copy `server/env.example` to `server/.env` and update the values
   - Copy `client/.env.example` to `client/.env` (if needed)

5. Seed the database with templates
   ```
   cd server
   node src/utils/seedTemplates.js
   ```

### Running the Application

1. Start the backend server
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
