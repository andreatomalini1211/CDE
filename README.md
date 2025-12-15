# 🏗️ React BIM CDE (Headless ACDAT)

An experimental Common Data Environment (CDE) based on **React**, **Three.js**, and the **GitHub API**.
This project demonstrates how to manage BIM files (`.bim` / dotBIM format) directly via the web, using GitHub as a backend for versioning and storage, eliminating the need for complex databases.

## ✨ Key Features

### 👁️ Visualization & Navigation
- **3D Engine:** Fluid rendering of BIM geometries via `@react-three/fiber`.
- **Camera Controls:** Orbital navigation, Fit View, and Orthographic Views (Top, Front, Left, Right).
- **Resource Explorer:** Navigate through private GitHub repositories and folders.

### 🛠️ BIM Data Management
- **Discipline Filters:** Quick toggles for ARC, STR, MEP elements.
- **Layer Management:** Visibility control by category (e.g., Walls, Windows) with a dedicated panel.
- **Hide Element:** Ability to isolate or hide specific objects by GUID.

### 💬 Collaboration
- **Annotations:** Add text comments linked to the object's GUID.
- **User Identity:** Comments automatically record the Author (GitHub User) and Timestamp.
- **Cloud Saving:** Data is written directly to the JSON on GitHub via automatic commits.

### 🕒 Time Machine (History)
- **Version History:** Navigate through past file commits.
- **Read-Only Mode:** Automatic editing block when viewing historical versions to ensure data integrity.

## 🚀 Installation and Setup

### Prerequisites
- Node.js installed.
- A GitHub Personal Access Token (PAT) with `repo` permissions.

### Setup
1. Clone the repository or download the folder.
2. Create a `.env` file in the project root:
   ```bash
   VITE_GITHUB_TOKEN=your_github_token_here
3. Install dependencies:
   `npm install`
4. Start the development server:
   `npm run dev`

## 🔗 Credits & Acknowledgements

This project is built upon the **dotbim** file format specification.
Special thanks to the original creator for providing a lightweight, developer-friendly BIM geometry standard.

- **Original Specification:** [dotbim](https://github.com/paireks/dotbim) by [paireks](https://github.com/paireks)








# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
