# ⚡ NEO-RES // Results & Record Management Engine

A **Neobrutalism-styled** web application built with **Next.js 16 (App Router)** and **Tailwind CSS**, designed for student result exploration and record management.

---

## 🚀 Features

### 1. 🔍 [HTTP GET] Student Results Engine
* **Instant Roll Number Lookup:** Enter a university registration number (e.g., `20241CCS0134`, `20241CCS0167`, `20251CCS0103`).
* **Multi-Semester Aggregation:** Queries all active semester examination cycles in parallel using internal tokens.
* **Detailed Academic Metrics:**
  * Cumulative Credits Registered & Earned
  * **SGPA** (Semester Grade Point Average)
  * **CGPA** (Cumulative Grade Point Average)
* **Subject Breakdown Table:** Course code, subject title, credit weighting, and color-coded retro brutalist grade badges (`O`, `A+`, `A`, `B+`, `B`, `F`).
* **Print / PDF Grade Card:** Clean print styling for export.

### 2. ✏️ [HTTP POST] Record Management & Simulation
* **Create & Update Student Records:** Submit an HTTP `POST` request to `/api/records` to store modified marks, simulated revaluations, or custom student profiles.
* **Dynamic Subject Editor:** Add, remove, and update course credits and grades in real time.
* **Pre-fill from Live Results:** Click *"Modify via POST"* on any fetched student semester to instantly load their data into the editor.

### 3. 💾 [Local Database] Persisted Store
* Inspect, search, and manage all records created via `POST`.
* Directly cross-reference stored records with live GET queries.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS with custom Neobrutalism utilities (hard offsets, sharp black borders, high-contrast palette)
* **Icons:** Lucide React
* **Backend:** Next.js Route Handlers (`/api/results`, `/api/records`)

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
# Visit http://localhost:3000
```

---

## 🌐 Deploying to Vercel

### Option 1: Via Vercel CLI
```bash
npx vercel
```

### Option 2: Via GitHub Integration
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository and click **Deploy**.
