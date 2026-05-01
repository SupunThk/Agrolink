# MongoDB Atlas connection troubleshooting (Windows DNS issues)

This repo’s backend includes safeguards to prevent MongoDB Atlas connection failures that can happen on Windows when VPN/adblock/DNS-proxy tools break DNS resolution.

## Symptoms / common errors

### `querySrv ECONNREFUSED _mongodb._tcp...`
- **Meaning:** The SRV record lookup for a `mongodb+srv://...` connection failed.
- **Typical cause:** Node is configured to use a bad DNS resolver (often only localhost resolvers like `127.0.0.1` / `::1`).

### `getaddrinfo ENOTFOUND ac-...mongodb.net`
- **Meaning:** SRV lookup succeeded, but resolving the shard hostnames failed.
- **Typical cause:** The OS resolver path used by `getaddrinfo` is broken/intercepted.

### `MongooseServerSelectionError` (timeouts)
- **Meaning:** Driver couldn’t select a server in time.
- **Typical causes:** Wrong URI/credentials, Atlas not reachable, DNS resolution problems, or temporary network blocks.

## What the backend already does

The backend startup logic in `backend/server.js` applies these reliability improvements automatically:

1. **DNS resolver override for SRV lookups**
   - If you set `DNS_SERVERS`, the process uses those resolvers.
   - Otherwise, if Node reports only localhost DNS resolvers, the process switches to public resolvers (Cloudflare/Google) for this Node process.

2. **Custom hostname lookup for shard hosts**
   - Even after SRV succeeds, the MongoDB driver may still fail resolving shard hostnames if the OS resolver is broken.
   - The backend provides a custom lookup that resolves A/AAAA records via Node’s DNS (c-ares) instead of the OS resolver.

3. **Faster, clearer failures**
   - Connection timeouts are set to 8000ms.
   - Error logging includes nested `reason` details and per-server network errors when available.

## Fix / setup steps

### 1) Configure backend environment

Create your local backend env file from the template:

PowerShell:
```powershell
cd backend
Copy-Item .env.example .env
```

bash:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
- `MONGO_URI` (required)
- `PORT` (optional)

### 2) Optional: force DNS resolvers (recommended if you’re on VPN/adblock)

PowerShell (current session):
```powershell
$env:DNS_SERVERS = "1.1.1.1,8.8.8.8"
```

bash:
```bash
export DNS_SERVERS="1.1.1.1,8.8.8.8"
```

Or put this in `backend/.env`:
```env
DNS_SERVERS=1.1.1.1,8.8.8.8
```

### 3) Install and run the backend

```bash
cd backend
npm install
npm run dev
```

Expected logs include:
- `MongoDB connected`
- `Server running on port 5000` (or your `PORT`)

## Verify the API is reachable

Health endpoint:

PowerShell:
```powershell
Invoke-WebRequest http://localhost:5000/ | Select-Object -ExpandProperty Content
```

bash:
```bash
curl http://localhost:5000/
```

Items endpoint:

PowerShell:
```powershell
Invoke-WebRequest http://localhost:5000/api/items | Select-Object -ExpandProperty Content
```

bash:
```bash
curl http://localhost:5000/api/items
```

## Atlas checklist (quick)

- **Network Access allowlist:** Ensure your current public IP is allowed (or temporarily allow `0.0.0.0/0` for testing).
- **Correct `MONGO_URI`:** Use the Atlas-provided `mongodb+srv://...` URI, with correct username/password and database.
- **Cluster status:** Cluster is running and not paused.

## Secrets management

- Never commit `backend/.env` (it should be ignored); commit only `backend/.env.example`.
- Each developer should copy `backend/.env.example` → `backend/.env` and fill their own credentials.
- If Atlas credentials were exposed (e.g., accidentally committed or shared), rotate the password in Atlas and update your local `MONGO_URI`.
