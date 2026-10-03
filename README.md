# 🏫 Campus Care

### Report • Resolve • A Better Campus

<p align="center">
  A transparent, real-time campus issue tracking and resolution platform built for students and maintenance staff.
</p>

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a>
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</p>

---

## 📌 About the Project

**Campus Care** is a transparent, real-time issue-tracking platform designed to simplify the way campus maintenance problems are reported, tracked, and resolved.

Built specifically with **Parul University's Goa campus** in mind, Campus Care bridges the communication gap between students and maintenance staff.

Instead of complaints getting lost in WhatsApp groups or informal conversations, students can report issues such as:

- 💡 Flickering or broken lights
- 📽️ Faulty projectors
- 🚰 Plumbing and water-related issues
- ⚡ Electrical problems
- 🪑 Damaged furniture
- 🏫 Other campus maintenance concerns

Students can track the complete lifecycle of their complaints, while caretakers get a centralized dashboard to manage, prioritize, and resolve issues efficiently.

> **Report an issue. Track its progress. See it resolved.**

---

## ✨ Features

### 🔐 Unified Authentication

Secure authentication with role-based access.

- Student registration and login
- Caretaker/admin authentication
- Protected admin routes
- Role-based redirection

---

### 📸 Rich Issue Reporting

Students can submit detailed maintenance requests with:

- Issue title
- Description
- Category
- Location
- Image attachments
- Room/floor information
- GPS coordinates when required

This provides maintenance staff with the context needed to resolve issues efficiently.

---

### 🚦 Issue Lifecycle Tracking

Every issue follows a clear resolution workflow:

```text
┌──────────┐       ┌──────────┐       ┌─────────────┐
│ PENDING  │ ───▶  │ WORKING  │ ───▶  │  COMPLETED  │
└──────────┘       └──────────┘       └─────────────┘
```
---
## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| ⚛️ Frontend | **Next.js + React** | Application framework and user interface |
| 🎨 Styling | **Tailwind CSS** | Responsive and modern UI design |
| 🧩 Icons | **Lucide React** | Clean and scalable iconography |
| 🗄️ Database | **PostgreSQL** | Structured storage for campus issues and application data |
| 🚀 Backend | **Supabase** | Backend services, database integration and APIs |
| 🔐 Authentication | **Supabase Auth** | Student and caretaker authentication |
| 📦 Storage | **Supabase Storage** | Issue images and resolution-proof uploads |
| ☁️ Deployment | **Vercel** | Hosting and continuous deployment |
| 🟦 Language | **TypeScript** | Type-safe application development |

---

### 📂 Project Structure


```markdown
## 📂 Project Structure

campus-issue-tracker/
│
├── backend/                   # Backend-related functionality
│
├── public/                    # Static assets and public files
│
├── src/                       # Main application source code
│
├── .gitignore                 # Git ignored files
├── AGENTS.md                  # Development instructions
├── CLAUDE.md                  # Project instructions
│
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── tsconfig.json              # TypeScript configuration
│
└── README.md                  # Project documentation
```
---
# 👨‍💻 Author

## Satwik Pagi

Built with ❤️ for the **Hacktoberfest 2026 Weekend Challenge**.

<p align="center">
  <a href="https://github.com/satwikpagi5-wq">
    <img 
      src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" 
      alt="GitHub Profile"
    />
  </a>
</p>

