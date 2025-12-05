# 🏗️ React BIM CDE (Headless ACDAT)

Un Ambiente di Condivisione Dati (ACDAT/CDE) sperimentale basato su **React**, **Three.js** e **GitHub API**.
Questo progetto dimostra come gestire file BIM (formato `.bim` / dotBIM) direttamente via web, utilizzando GitHub come backend per il versionamento e lo storage, eliminando la necessità di database complessi.

## ✨ Funzionalità Principali

### 👁️ Visualizzazione & Navigazione
- **Motore 3D:** Rendering fluido di geometrie BIM tramite `@react-three/fiber`.
- **Controlli Camera:** Navigazione Orbitale, Fit View e Viste Ortogonali (Top, Front, Left, Right).
- **Esplora Risorse:** Navigazione tra repository e cartelle GitHub private.

### 🛠️ Gestione Dati BIM
- **Filtri Disciplina:** Toggle rapido per elementi ARC, STR, MEP.
- **Gestione Layer:** Visibilità per categorie (es. Muri, Finestre) con pannello dedicato.
- **Nascondi Elemento:** Possibilità di isolare o nascondere singoli oggetti GUID.

### 💬 Collaborazione
- **Annotazioni:** Aggiunta di commenti testuali legati al GUID dell'oggetto.
- **Identità Utente:** I commenti registrano automaticamente Autore (GitHub User) e Timestamp.
- **Salvataggio Cloud:** I dati vengono scritti direttamente nel JSON su GitHub tramite commit automatici.

### 🕒 Time Machine (Cronologia)
- **Storico Versioni:** Navigazione tra i commit passati del file.
- **Read-Only Mode:** Blocco automatico delle modifiche quando si visualizzano versioni storiche per garantire l'integrità dei dati.

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js installato.
- Un Personal Access Token (PAT) di GitHub con permessi `repo`.

### Setup
1. Clona la repository o scarica la cartella.
2. Crea un file `.env` nella root del progetto:
   ```bash
   VITE_GITHUB_TOKEN=il_tuo_token_github_qui
