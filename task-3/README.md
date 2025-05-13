# Date Calculator API

A simple HTTP server built with Node.js and TypeScript that performs date arithmetic calculations. The server accepts natural-language-style calendar questions and returns the calculated dates.

## Features

- Add or subtract days/weeks from today's date
- Add or subtract days/weeks from any specific date
- Natural language query format
- Simple and intuitive API

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task-3
```

2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Running the Server

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## API Usage

### Endpoint

```
GET /date
```

### Query Parameter

- `q`: The date calculation query in natural language format

### Query Format

```
/date?q=operation, value unit to/from date
```

Where:

- `operation`: "add" or "subtract"
- `value`: number of days or weeks
- `unit`: "days" or "weeks"
- `date`: either "today" or a date in DD-MMM-YYYY format (e.g., 12-Jan-2019)

### Examples

1. Add days to today:

```
/date?q=add, 6 days to today
```

2. Add weeks to today:

```
/date?q=add, 6 weeks to today
```

3. Subtract days from a specific date:

```
/date?q=subtract, 187 days from 12-Jan-2019
```

### Response Format

Success Response:

```json
{
  "result": "18-Mar-2024"
}
```

Error Response:

```json
{
  "error": "Invalid query format",
  "examples": [
    "add, 6 days to today",
    "add, 6 weeks to today",
    "subtract, 187 days from 12-Jan-2019"
  ]
}
```

## Project Structure

```
task-3/
├── src/
│   └── server.ts      # Main server implementation
├── dist/              # Compiled JavaScript files
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md         # This file
```

## Development

The project uses:

- TypeScript for type safety
- Express.js for the HTTP server
- date-fns for date manipulation

### Available Scripts

- `npm run build`: Compiles TypeScript to JavaScript
- `npm start`: Runs the compiled server
- `npm run dev`: Runs the server in development mode with auto-reload

## Error Handling

The server provides helpful error messages for:

- Missing query parameter
- Invalid query format
- Invalid date format
- Invalid operation

