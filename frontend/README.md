# Web Applications

This folder contains two independent Vite applications. Run them from their own directories and point both to the backend API and Socket.IO server.

## Admin and cashier dashboard

```powershell
cd frontend/admin
npm install
Copy-Item .env.example .env
npm run dev
```

The local development server defaults to `http://localhost:5173`.

## Customer portal

```powershell
cd frontend/customer
npm install
Copy-Item .env.example .env
npm run dev
```

Vite selects the next available port when 5173 is occupied. Update `VITE_API_URL` and `VITE_SOCKET_URL` in each app's `.env` when your backend runs at a different address.
