# PhotoNarrator

PhotoNarrator is a modern web application built with **Next.js (TypeScript)** and **Firebase**.  
It provides a foundation to build photo-related storytelling experiences, integrating server-side rendering with client interactivity. This project is based on the Firebase Studio starter, giving you authentication, hosting, and scalable backend integration out of the box.

---

## 🚀 Project Overview

PhotoNarrator is designed to serve as a starting point for applications that require:

- Fast web performance with Next.js  
- Integrated backend using Firebase  
- A scalable and extendable codebase  
- TypeScript for type safety  
- Clean folder structure and ready-to-use configuration  

Use it to build features like photo uploads, narratives tied to images, AI-powered annotations, galleries, and more.

---

## ✨ Key Features

- **Next.js + React + TypeScript** for modern frontend  
- **Firebase integration** for backend services  
- Preconfigured **hosting and authentication**  
- Ready template from **Firebase Studio**  
- Easy to extend for features like photo storage, user accounts, and AI captions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js |
| Language | TypeScript |
| Backend & Auth | Firebase |
| Build Tool | Vercel / Firebase Hosting |
| Styling | Tailwind CSS (likely, based on template conventions) |

---

## 📁 How It Works

1. **Next.js** serves frontend pages with server rendering support.  
2. **Firebase** hosts backend services (auth, functions, database, hosting).  
3. You build features like photo upload, user accounts, tags, and narratives on top of this setup.  
4. Deploy to Firebase with built-in tools.

---

## 🧑‍💻 Installation

### Prerequisites

Before installing, make sure you have:

- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase CLI installed (`npm install -g firebase-tools`)

---

### Steps

1. Clone the repository:

```bash
git clone https://github.com/pushkar156/PhotoNarrator.git
cd PhotoNarrator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a Firebase project and configure your app:

```bash
firebase login
firebase init
```

Make sure to enable **Authentication** and **Hosting**.

4. Set your Firebase config in environment variables:

Create a file named `.env.local` at the root with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## ▶️ Run Locally

Start your dev server:

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

---

## 📁 Project Structure

```text
PhotoNarrator/
├── src/
│   ├── app/                # Next.js pages & layouts
│   ├── components/         # Reusable UI components
│   ├── firebase/           # Firebase config
│   ├── styles/             # Styling files
│   └── utils/              # Utility functions
├── .gitignore
├── README.md
├── package.json
├── next.config.ts
├── firebase.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🧠 Suggested Enhancements

You can build on this foundation by adding:

- Photo upload UI and Firebase Storage support
- AI narration or auto-caption generation
- User profiles with saved stories
- Galleries and shareable narratives
- Comments and social features

---
