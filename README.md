# 🏗️ React BIM CDE (Headless ACDAT)

An experimental **Common Data Environment (CDE)** and **Decision Support System (DSS)** developed to explore the potential of serverless architecture in the AEC industry.

This project demonstrates a "Headless" approach to BIM data management: instead of relying on proprietary servers or complex SQL databases, it utilizes **GitHub** as a distributed, versioned backend. The application runs entirely client-side, leveraging the user's browser for 3D computation and the GitHub API for data persistence and **ISO 19650 compliant workflows**.

## 🌐 Live Demo / Testing

You can test the latest deployment of this prototype directly in your browser without any local installation:

👉 **[Launch Application (Vercel)](https://cde-delta.vercel.app/)**

*Note: Since this is a serverless BYOT (Bring Your Own Token) application, you will still need to input your GitHub Personal Access Token to authenticate and access your repositories.*

## 🧠 Methodology: Antigravity & Vibe Coding

This software was developed using an **AI-Assisted "Vibe Coding" methodology**.
The development process moved away from traditional syntax-heavy programming towards a flow-based, intent-driven approach. By leveraging **Antigravity** (LLM-based reasoning agents) as a pair programmer, the project bridges the gap between high-level architectural domain knowledge and complex full-stack implementation.

This repository serves as a case study on how domain experts (Architects/Engineers) can rapidly prototype sophisticated software tools by directing AI logic rather than writing every line of boilerplate code manually.

## 📐 System Architecture

The application follows a **Client-Side Rendering (CSR)** architecture with a **BaaS (Backend-as-a-Service)** model provided by GitHub.

* **Frontend Core:** React + Vite + **Recharts** for data visualization.
* **3D Engine:** Three.js (via `@react-three/fiber`) for high-performance rendering.
* **IFC Parser:** `web-ifc` (WASM) for client-side parsing of Industry Foundation Classes.
* **State Management:** Zustand for handling complex multi-model states and filtering logic.
* **Persistence & Logic:** GitHub API (Octokit) acting as a NoSQL document store and **Workflow Engine** (Pull Requests as Approval Gates).

### 🔀 Adaptive Loading Pipeline (The "Hybrid" Engine)
To ensure accessibility and performance, this CDE features a transparent, dual-engine loading strategy designed to provide a **"Single Pane of Glass"** experience:

* **⚡ The "Fast Lane" (dotBIM):** Optimized for web performance. JSON-based geometry is parsed natively by the browser without overhead.
* **🏗️ The "Compatibility Lane" (IFC):** Powered by a WASM (WebAssembly) backend. This allows the application to ingest industry-standard IFC files directly, "transpiling" complex parametric geometry into renderable meshes on the fly.

## ✨ New in V4: Advanced CDE Features

This version introduces logic to transform the viewer into a collaborative management platform.

### 🔄 ISO 19650 Workflow (Git-Powered) 

[Image of gitflow workflow diagram]

The application maps the ISO 19650 information containers directly to Git Branching strategies, enforcing a structured approval process without external databases.

| ISO 19650 State | Git Concept | Description |
| :--- | :--- | :--- |
| **WIP (Work In Progress)** | `wip-*` branches | Private sandbox for disciplines (e.g., `wip-architecture`). Changes here are free and frequent. |
| **SHARED (Gate)** | `shared` branch | **Protected Area.** Files can only enter here via approval. |
| **PUBLISHED** | `main` branch | **Contractual Area.** The "Gold Master" of the project. |

* **The "Promote" Engine:** Users cannot manually overwrite Shared/Published files. A dedicated **"Promote to Shared"** button triggers a **GitHub Pull Request**. This digitally enforces the "Four-Eyes Principle" (Author $\neq$ Approver), delegating the validation process to the GitHub Review interface.

### 📊 Analytic Dashboard & Decision Support
The Right Sidebar now acts as a Project Health Monitor, moving beyond simple geometry viewing:

* **Real-time Analytics:** Interactive Pie and Bar charts (powered by `recharts`) visualize issues by **Priority** and **Author**.
* **Smart Issue List:** A scrollable, interactive feed of project issues. Clicking an item triggers a **"Fly-to"** camera animation, instantly taking the user to the problem location.
* **BCF-style Priorities:** Issues now carry metadata (High, Medium, Low).

### 🎨 3D Visual Semantics
The 3D environment provides immediate visual feedback on project criticalities:
* **Context-Aware Pins:** The spherical markers in the 3D scene change color dynamically based on the issue priority:
    * 🔴 **Bordeaux:** High Priority / Critical
    * 🔴 **Red:** Medium Priority
    * 🟠 **Orange:** Low Priority
    * 🟡 **Yellow:** Info / No Priority
* This creates an instant "Heatmap" of the project directly on the geometry.

## 🛠️ Standard Features

### 👁️ Visualization & Navigation
* **Hybrid Model Support (.bim & .ifc):** Native support for dotBIM and IFC.
* **Advanced Camera Control:** Integrated orbital navigation with specific commands for Orthographic projections.
* **Multi-Model Federation:** Capability to overlay multiple files (ARC, STR, MEP).

### 🛠️ BIM Data Management
* **Semantic Filtering:** Dynamic extraction of disciplines from loaded files.
* **Ghost Mode Search:** Real-time opacity filtering by GUID or Name.
* **Full Parameter Access:** Inspection of BIM parameters via the properties sidebar.

### 💬 Collaboration & Versioning
* **Contextual Annotation:** Users can attach comments directly to 3D elements.
* **Time Machine:** Leveraging Git's native version control, users can navigate through the history of the project commits in "Read-Only" mode.

## ⚡ Technical Stack & Performance

This project is built on the modern **React ecosystem**, optimized for speed and modularity via **Vite**.

* **Build Tool:** Vite (replaces Webpack).
* **Visualization:** Recharts (D3-based wrapper for React).
* **Linter:** ESLint with recommended settings.

### ⚠️ Note on IFC Performance (Experimental)
Opening standard `.ifc` files is a **heavy client-side operation**.
* **Memory Usage:** Parsing IFC files requires compiling geometry in the browser via WebAssembly (WASM).
* **Load Time:** Please be patient. Parsing IFC is significantly slower than dotBIM.

## 🚀 Installation and Setup

This application operates on a **BYOT (Bring Your Own Token)** model.

### Prerequisites
* **Node.js** (v16 or higher).
* A **GitHub Account**.

### Local Deployment
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies (Legacy Peer Deps required for Three.js/Recharts compatibility):**
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the App:**
    Open the local URL (usually `http://localhost:5173`) and enter your GitHub Token.

## 🤝 Contribution & Future Implementations

This project is an academic proof-of-concept. I am actively looking for feedback on:
* Optimization of the client-side IFC parser.
* Expansion of the "Vibe Coding" methodology for AEC tools.

## 🔗 Credits & Acknowledgements

* **BIM Standard:** [dotbim](https://github.com/paireks/dotbim) by paireks.
* **IFC Loader:** [web-ifc](https://github.com/ThatOpen/engine_components).
* **Core Logic:** Developed with the assistance of LLM-based reasoning (Antigravity).

---

## 📬 Contact & Author

Developed by **Andrea Tomalini**.

* **LinkedIn:** [Andrea Tomalini](https://www.linkedin.com/in/andrea-tomalini/)
* **ResearchGate:** [Profile](https://www.researchgate.net/profile/Andrea-Tomalini?ev=hdr_xprf)
* **Instagram:** [@andrea_tomalini](https://www.instagram.com/andrea_tomalini/)
* **Email:** [andreatomalini@gmail.com](mailto:andreatomalini@gmail.com)