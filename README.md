# 🏗️ React BIM CDE (Headless ACDAT)

An experimental **Common Data Environment (CDE)** and **BIM Viewer** developed to explore the potential of serverless architecture in the AEC (Architecture, Engineering, and Construction) industry.

This project demonstrates a "Headless" approach to BIM data management: instead of relying on proprietary servers or complex SQL databases, it utilizes **GitHub** as a distributed, versioned backend. The application runs entirely client-side, leveraging the user's browser for 3D computation and the GitHub API for data persistence.

## 🧠 Methodology: Antigravity & Vibe Coding

This software was developed using an **AI-Assisted "Vibe Coding" methodology**.
The development process moved away from traditional syntax-heavy programming towards a flow-based, intent-driven approach. By leveraging **Antigravity** (LLM-based reasoning agents) as a pair programmer, the project bridges the gap between high-level architectural domain knowledge and complex full-stack implementation.

This repository serves as a case study on how domain experts (Architects/Engineers) can rapidly prototype sophisticated software tools by directing AI logic rather than writing every line of boilerplate code manually.

## 📐 System Architecture

The application follows a **Client-Side Rendering (CSR)** architecture with a **BaaS (Backend-as-a-Service)** model provided by GitHub.

* **Frontend Core:** React + Vite for the reactive user interface.
* **3D Engine:** Three.js (via `@react-three/fiber`) for high-performance rendering.
* **IFC Parser:** `web-ifc` (WASM) for client-side parsing of Industry Foundation Classes.
* **State Management:** Zustand for handling complex multi-model states and filtering logic.
* **Persistence Layer:** GitHub API (Octokit) acting as a NoSQL document store for JSON-based BIM files (`.bim`), `.ifc` files, and metadata.

### 🔀 Adaptive Loading Pipeline (The "Hybrid" Engine)
To ensure accessibility and performance, this CDE features a transparent, dual-engine loading strategy designed to provide a **"Single Pane of Glass"** experience:

* **⚡ The "Fast Lane" (dotBIM):** Optimized for web performance. JSON-based geometry is parsed natively by the browser without overhead, offering instant load times and minimal memory footprint. Ideal for quick reviews and mobile access.
* **🏗️ The "Compatibility Lane" (IFC):** Powered by a WASM (WebAssembly) backend. This allows the application to ingest industry-standard IFC files directly. The loader automatically "transpiles" complex IFC parametric geometry into renderable meshes on the fly, creating a seamless user experience despite the heavier computational load.

**Result:** Users interact with heterogeneous data sources through a unified interface, unaware of the underlying complexity switching logic.

## ✨ Key Features

### 👁️ Visualization & Navigation
* **Hybrid Model Support (.bim & .ifc):** Native support for the lightweight **dotBIM** format for instant loading, plus experimental support for standard **IFC (Industry Foundation Classes)** files.
* **Advanced Camera Control:** Integrated orbital navigation with specific commands for "Fit View" and Orthographic projections (Top, Front, Right).
* **Multi-Model Federation:** Capability to load and overlay multiple files (e.g., ARC, STR, MEP) simultaneously in a single scene.

### 🛠️ BIM Data Management
* **Semantic Filtering:** Dynamic extraction of disciplines (ARC, STR, MEP) from loaded files, allowing for instant discipline-based isolation.
* **Layer Management:** Granular visibility management based on IFC categories (Walls, Slabs, Windows).
* **Ghost Mode Search:** Real-time opacity filtering to highlight specific elements by GUID or Name while keeping the context visible.
* **Full Parameter Access:** Complete inspection of BIM parameters and attributes for both dotBIM and IFC elements via the properties sidebar.

### 💬 Collaboration & Versioning
* **Contextual Annotation:** Users can attach comments directly to 3D elements.
* **Identity Tracking:** Annotations automatically record the GitHub User identity and timestamp.
* **Time Machine:** Leveraging Git's native version control, users can navigate through the history of the project commits in "Read-Only" mode to inspect previous states of the model.

## ⚡ Technical Stack & Performance

This project is built on the modern **React ecosystem**, optimized for speed and modularity via **Vite**.

* **Build Tool:** Vite (replaces Webpack for faster HMR and optimized production builds).
* **Linter:** ESLint with recommended settings for React to ensure code quality.
* **Rendering:** The application uses client-side GPU acceleration.

### ⚠️ Note on IFC Performance (Experimental)
While `.bim` (dotBIM) files load instantly and are geometry-optimized, opening standard `.ifc` files is a **heavy client-side operation**.
* **Memory Usage:** Parsing IFC files requires compiling geometry in the browser via WebAssembly (WASM). This creates a high RAM footprint (several hundred MBs to GBs depending on file size).
* **Load Time:** Please be patient. Parsing, normalization, and rendering of IFC files is significantly slower than dotBIM.
* **Geometry Artifacts:** Complex parametric geometries (e.g., curved walls, advanced boolean operations) may occasionally exhibit triangulation errors or visual artifacts due to WebGL precision limits. However, **semantic data and parameters remain accurate and fully accessible**.

*Note: The React Compiler is currently disabled to ensure maximum compatibility with Three.js libraries.*

## 🚀 Installation and Setup

This application operates on a **BYOT (Bring Your Own Token)** model to ensure security and decentralization. No server setup is required.

### Prerequisites
* **Node.js** (v16 or higher).
* A **GitHub Account**.

### Local Deployment
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the App:**
    Open the local URL provided (usually `http://localhost:5173`). You will be prompted to enter your **GitHub Personal Access Token**. This token is stored locally in your browser and is never sent to any external server other than GitHub itself.

## 🤝 Contribution & Future Implementations

This project is an academic proof-of-concept, but it is designed to be scalable.
I am actively looking for feedback, contributions, and collaborations on similar topics, specifically:
* Optimization of the client-side IFC parser (geometry simplification).
* Advanced Clash Detection logic in the browser.
* Expansion of the "Vibe Coding" methodology for AEC tools.

If you are interested in collaborating or discussing the architecture, please open an Issue or a Pull Request.

## 🔗 Credits & Acknowledgements

* **BIM Standard:** Built upon the [dotbim](https://github.com/paireks/dotbim) specification by [paireks](https://github.com/paireks). Special thanks for providing a lightweight, developer-friendly open geometry standard.
* **IFC Loader:** Powered by [web-ifc](https://github.com/ThatOpen/engine_components) / ThatOpen Company technologies.
* **Core Logic:** Developed with the assistance of LLM-based reasoning (Antigravity).

---

## 📬 Contact & Author

Developed by **Andrea Tomalini**.
Feel free to reach out for research collaborations or technical discussions.

* **LinkedIn:** [Andrea Tomalini](https://www.linkedin.com/in/andrea-tomalini/)
* **ResearchGate:** [Profile](https://www.researchgate.net/profile/Andrea-Tomalini?ev=hdr_xprf)
* **Instagram:** [@andrea_tomalini](https://www.instagram.com/andrea_tomalini/)
* **Email:** [andreatomalini@gmail.com](mailto:andreatomalini@gmail.com); [andrea.tomalini@polito.it](mailto:andrea.tomalini@polito.it)
