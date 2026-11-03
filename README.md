# ⚡ NEO-RES // Comprehensive University Student Suite

A **Neobrutalism-styled** web portal built with **Next.js 16 (App Router)** and **Tailwind CSS**, transforming the UNICLARE / COE backend functions into a modern, full-featured student suite.

---

## 🚀 Features

### 1. 📊 Semester Grade Cards & SGPA/CGPA Engine (`getDetailedResults`)
* **Live Roll Number Lookup:** Queries student examination cycles in parallel using session tokens.
* **Student Identity Card:** Photo, student name, university degree, college name, and parents' details.
* **Academic Performance:** Registered Credits, Earned Credits, **SGPA**, and **CGPA**.
* **Subject Breakdown Table:** Course codes, course names, credits, and retro Neobrutalist grade badges (`O`, `A+`, `A`, `B+`, `B`, `F`).
* **Print / Save as PDF:** Clean print styles for grade card export.

### 2. 🎯 Raw Component-Wise Marks Inspector (`getBriefResults`)
* **Unveils Internal & External Assessment Marks:** Unlocks raw marks that students usually don't see on the standard grade card:
  * **End-Term Exam Marks**
  * **Mid-Term Exam Marks**
  * **Continuous Assessment (CA) Marks**
  * **Practical Lab Scores** (e.g. 97/100, 94/100, 45.5/50)
* **Semester Switcher:** Inspect assessment breakdowns across any semester.

### 3. ⏳ Academic Timeline & Degree Progression (`getResultSummaryDetailsnew`)
* **Degree History & Milestones:** Chronological transcript across all examination cycles (`D-2026-1`, `C-2025-4`, `B-2025-1`, `A-2024-4`).
* **Official Publication Dates:** Precise result publication and examination session dates (`01/07/2026`, `03/02/2026`, `14/07/2025`, `28/04/2026`).
* **Result Status:** Verification tags and class standing.

### 4. ⚖️ Re-Evaluation (RV) & Challenge Portal (`showRVExam`)
* **Review-Eligible Exam Cycles:** Direct lookup of examination sessions mapped for review.
* **Academic Regulations (Clause 13.2):** Official rules regarding the 5-working-day review window, photocopy guidelines, and grading scales.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS with custom Neobrutalism utilities
* **Icons:** Lucide React
* **Backend:** Next.js Route Handlers (`/api/results`)

---

## 💻 Local Development

```bash
cd ~/Downloads/😆😆😆/neores
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploy to Vercel

1. Push to your GitHub repository.
2. Go to **[vercel.com/new](https://vercel.com/new)**.
3. Import **`sxfiyan/neo-res`** and click **Deploy**.
