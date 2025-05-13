# GitHub Issue Analyzer

A Next.js application that analyzes GitHub repository issues and provides detailed metrics and visualizations.

## Features

- **Issue Status Analysis**

  - Visual representation of open vs closed issues
  - Percentage breakdown of issue status
  - Total count of issues by status

- **Weekly Issue Activity**

  - Last 10 weeks of issue activity
  - Created vs closed issues per week
  - Total counts for created and closed issues

- **Weekly Closure Rate**

  - Line chart showing closure rates over time
  - Average weekly closure rate
  - Highest weekly closure rate
  - Formula: Issues closed / (Issues open at start + New issues created)

- **New vs Closed Issues Ratio**

  - Weekly ratio of new to closed issues
  - Visual indicators for weeks with more created vs closed issues
  - Summary of weeks above/below 1:1 ratio

- **Comprehensive Issue List**
  - Modal view of all issues
  - Sortable by creation date and issue number
  - Search functionality by title
  - Direct links to GitHub issues
  - Status indicators

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd github-issue-analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting a GitHub Token

1. Go to GitHub.com and log in
2. Click your profile picture → Settings
3. Scroll to "Developer settings" (bottom of left sidebar)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
   - `read:user` (Read user data)

## Usage

1. Enter a GitHub repository in the format `owner/repo` (e.g., `facebook/react`)
2. View the analysis dashboard with various metrics
3. Click "View All Issues" to see the complete list of issues
4. Use the search and sort functionality in the issues table

## Project Structure

```
github-issue-analyzer/
├── app/
│   ├── analyze/
│   │   └── [owner]/
│   │       └── [repo]/
│   │           └── page.tsx    # Analysis page
│   ├── page.tsx               # Home page
│   └── layout.tsx             # Root layout
├── components/                # Reusable components
├── public/                    # Static assets
└── styles/                    # Global styles
```
## Acknowledgments

- GitHub API for providing the data
