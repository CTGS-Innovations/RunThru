# RunThru Backend API

Node.js Express API server for RunThru theatrical rehearsal app.

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Server runs on [http://localhost:4000](http://localhost:4000).

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── routes/                # API route handlers
│   │   ├── health.routes.ts
│   │   ├── scripts.routes.ts
│   │   └── sessions.routes.ts
│   ├── services/              # Business logic
│   │   ├── database.service.ts
│   │   ├── scriptParser.service.ts
│   │   └── ttsClient.service.ts
│   ├── models/                # TypeScript types
│   ├── middleware/            # Express middleware
│   ├── config/                # Configuration
│   └── utils/                 # Utilities
├── database/
│   └── schema.sql             # SQLite schema
└── package.json
```

## Tech Stack

- **Framework**: Express 4
- **Language**: TypeScript (strict mode)
- **Database**: SQLite (better-sqlite3)
- **Logging**: Winston
- **Validation**: Zod

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Scripts
- `GET /api/scripts` - List all scripts
- `POST /api/scripts` - Upload new script
- `GET /api/scripts/:id` - Get script details
- `DELETE /api/scripts/:id` - Delete script

### Sessions
- `POST /api/sessions` - Create rehearsal session
- `GET /api/sessions/:id` - Get session details

## Environment Variables

Create a `.env` file:

```bash
PORT=4000
NODE_ENV=development
DATABASE_PATH=./database/runthru.db
TTS_SERVICE_URL=http://localhost:5000
PIN_CODE=1234
```

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Test health endpoint: `curl http://localhost:4000/api/health`
4. Implement script parser logic
5. Implement session management
