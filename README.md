# CS322 Project Gallery

A gallery website where CS322 students can submit and browse each other's final projects.

## Stack

- **Next.js 15** (App Router) — frontend + API routes
- **MongoDB Atlas** — stores project submissions
- **Tailwind CSS** — styling
- **Vercel** — deployment

## Run locally

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) and grab the connection string.

2. Clone and install:
   ```bash
   git clone <repo-url>
   cd CS322-Project-Gallery
   npm install
   ```

3. Create `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/cs322gallery
   ```

4. Start:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add `MONGODB_URI` under **Environment Variables**.
4. Deploy.

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List all projects (`?search=` supported) |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get one project |
| DELETE | `/api/projects/:id` | Delete a project |
