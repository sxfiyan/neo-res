# ⚡ NEO-RES // Pure Black & White Neomorphism Suite

A **Neomorphism (Soft UI)** web portal built with **Next.js 16 (App Router)** and **Tailwind CSS**, styled exclusively with **pure black and white (monochrome)** tactile 3D embossed and debossed surfaces.

---

## 🎨 Design System: Pure Black & White Neomorphism
* **Extruded 3D Surfaces (`neu-card`, `neu-flat`):** Soft dual-shadow relief that emerges seamlessly from the background.
* **Debossed / Sunken Wells (`neu-inset`):** Inset sensory depth for inputs, telemetry, and active navigation states.
* **Tactile Buttons (`neu-btn`):** Physical button feedback that transitions smoothly from raised to pressed on interaction.
* **Strict Monochrome:** Pure blacks, whites, and subtle tactile grays — zero external colors.
* **Dark & Light Mode Switcher:** Toggle between Dark Obsidian Neomorphism and Silver White Neomorphism with one click.

---

## 🚀 Features

### 1. 📊 Semester Grade Cards & SGPA/CGPA Engine (`getDetailedResults`)
* **Student Identity Card:** Photo, student name, university program, college, and parents' details.
* **Academic Performance:** Registered Credits, Earned Credits, **SGPA**, and **CGPA** in tactile inset wells.
* **Subject Breakdown Table:** Course codes, titles, credits, and monochromatic Neomorphic grade badges (`O`, `A+`, `A`, `B+`, `B`, `F`).
* **Print / Save as PDF:** One-click clean A4 printable export.

### 2. 🎯 Raw Component-Wise Marks Breakdown (`getBriefResults`)
* **200-Mark Unified Evaluation Formula:**
  $$\text{CA (out of 50)} + \text{MIDTERM (out of 50)} + \text{ENDTERM (out of 100)} = 200 \text{ MARKS TOTAL}$$
* **Continuous Assessment (CA):** Assignments, quizzes, and coursework scores.
* **Midterm Examination:** Mid-semester written test scores.
* **Endterm Examination (Calculated):** Derived from official awarded grade thresholds with minimum/maximum score bounds.
* **Interactive What-If Simulator:** Live slider to simulate how hypothetical End-Term scores impact the final letter grade.

### 3. 📖 Evaluated Answer Scripts & Mid-Term Marksheet (`scriptView.php`)
* **Digital Valuation System (DVS) Gateway:** Direct integration with `https://dvs1.pgi-intraconnect.in`.
* **Verified Mid-Term Secured Marks:** Official course-by-course secured marks out of 50.
* **High-Resolution Answer Booklets:** Direct one-click access to actual page-by-page scanned answer booklets with evaluator markings and question allocations.

### 4. ⏳ Degree Timeline & Examination Milestones (`getResultSummaryDetailsnew`)
* **Transcript Milestones:** Chronological milestones across all examination cycles.
* **Official Publication Dates:** Precise result publication dates and verified class standings.

### 5. ⚖️ Re-Evaluation (RV) & Regulations Portal (`showRVExam`)
* **COE Review Session Lookup:** Displays examination sessions returned by the university's review endpoint without treating the listing as an eligibility decision.
* **COE Application Services:** Shortcuts to the official makeup, grade review/retotalling, summer-term, and re-registration pages. Applications and payments remain on the university portal.
* **Review Guidance:** Links to the university's review form and directs students to check the current examination notice for deadlines and eligibility.

---

## 💻 Local Development

```bash
cd ~/Downloads/😆😆😆/neores
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploy to Vercel

1. Push to GitHub (`main` branch):
   ```bash
   git push origin main
   ```
2. Connected to Vercel via **`sxfiyan/neo-res`** with automatic CI/CD deployment on every push.
