# Node Boilerplate

Production-ready Node.js starter including Express, EJS, SQLite (with session store), Socket.IO, file uploads and modular auth.

Setup

1. Install dependencies:

```powershell
npm install
```

2. Copy `.env_template` to `.env` and fill values (especially `SESSION_SECRET` and `DATABASE_FILE`).

3. Initialize the database:

```powershell
npm run init-database
```

4. Run in development:

```powershell
npm run dev
```

Folder structure

- `server.js` - main entry starting HTTP + Socket.IO
- `app.js` - Express app (mounted by server)
- `data/` - database file and `uploads/`
- `middleware/` - Express and Socket middleware
- `modules/` - app logic: auth, sockets, logger, db
- `routes/` - route handlers
- `sockets/` - Socket.IO event handlers
- `views/` - EJS templates

Notes

- This starter uses an in-memory instance manager for rooms; replace with persistent store for production.
- `modules/formbarClient.js` and `formbarAuth.js` include stubs—replace with proper API calls to Formbar.
- Uploaded files are stored under `data/uploads/` and should be protected or served carefully in production.
