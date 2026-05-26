Systemd unit for Price Index scraper

Install and run

1. Copy the unit file to the system directory (as root):

```bash
sudo cp deploy/price-scraper.service /etc/systemd/system/price-scraper.service
sudo systemctl daemon-reload
```

2. Edit the unit: open `/etc/systemd/system/price-scraper.service` and set:
- `WorkingDirectory` to the absolute path of this repository on the server (e.g. `/home/ubuntu/Price_Index`).
- Add `Environment=` lines for `DATABASE_URL` and any other secrets, or use a systemd drop-in file.
- Optionally change `User` to a non-root user that owns the project files.

3. Prepare the app on the server (run once):

```bash
cd /path/to/Price_Index
npm ci
# apply prisma migrations / seed if needed
npm run prisma:migrate
```

4. Enable and start the service:

```bash
sudo systemctl enable --now price-scraper.service
sudo journalctl -u price-scraper.service -f
```

Notes
- The unit runs `npm run scrape:cron` which uses `ts-node` in this repo; ensure `ts-node` and dev dependencies are installed if you rely on that.
- For production, prefer building/transpiling scripts and running the compiled JS with `node` (recommended improvement).
- Use a systemd drop-in (`/etc/systemd/system/price-scraper.service.d/env.conf`) to store secrets securely.
- If logs need rotation, configure `rsyslog`/`logrotate` or use the journal.
