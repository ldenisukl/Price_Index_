import cron from 'node-cron';
import { runAll } from './scraper-runner';

// Every 12 hours at minute 0 (midnight and noon)
cron.schedule('0 */12 * * *', async () => {
  console.log('Running scheduled scraper (every 12h):', new Date().toISOString());
  try {
    await runAll();
  } catch (err) {
    console.error('Scheduled run error', err);
  }
});

console.log('Scrape cron started. Runs every 12 hours at minute 0.');
