# International SIM Sales Dashboard 🌐📱

A modern web application and dashboard for monitoring daily international roaming SIM card sales, revenue metrics, market demand by country, and activation success rates.

---

## Features
- **Key Performance Indicators (KPIs)**: Total SIMs Sold, Total Revenue (in ₹), Top Country, and Activation Success Rate with trend badges.
- **Dynamic Date Filtering**: Filter sales data by date (`2026-06-27` to `2026-06-30`).
- **Interactive Sales Trends**: Visual progress bars showing relative sales volume with active highlights and click-to-select interaction.
- **Automated Sales Insights**: Contextual operational and sales commentary for each date.
- **Dual Runtime Support**:
  - **Local Development**: Express.js server serving static assets and API at `http://localhost:3000`.
  - **Cloud Serverless**: Native Vercel Serverless Function under `api/sales.js`.

---

## Project Structure
```text
international-sim-sales-dashboard/
├── api/
│   └── sales.js          # Vercel Serverless Function for /api/sales
├── index.html            # Dashboard UI markup
├── style.css             # Responsive styling and animations
├── script.js             # Client-side API integration and DOM updates
├── server.js             # Local Express.js backend server
├── package.json          # Node dependencies and npm scripts
├── vercel.json           # Vercel deployment and routing configuration
└── README.md             # Project documentation
```

---

## API Endpoints

### 1. Get Single Date Sales
- **URL**: `/api/sales?report_date=YYYY-MM-DD`
- **Method**: `GET`
- **Example Request**:
  ```bash
  GET /api/sales?report_date=2026-06-28
  ```
- **Example Response**:
  ```json
  {
    "report_date": "2026-06-28",
    "total_units_sold": 1120,
    "total_revenue": 735000,
    "top_country": "Singapore",
    "activation_success_rate": 90.8,
    "units_trend": "+8% vs previous day",
    "revenue_trend": "Revenue improved",
    "activation_status": "Stable operations",
    "trend_type": "positive",
    "insight": "Singapore sales improved with better activation performance and stronger revenue."
  }
  ```

### 2. Get All Dates & Summary
- **URL**: `/api/sales` (or `/api/sales?report_date=all`)
- **Method**: `GET`
- **Response**: List of all dates, summaries, and full sales dictionary.

---

## Getting Started Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open Dashboard**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying on Vercel

### Option 1: Deploy with Vercel CLI
```bash
npx vercel
```
Follow the prompts to link and deploy your project.

### Option 2: Deploy via GitHub / Vercel Dashboard
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Fix dashboard and configure Vercel deployment"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository (`international-sim-sales-dashboard`).
4. Click **Deploy**. Vercel will automatically detect the static assets and the `/api/sales.js` serverless function.
