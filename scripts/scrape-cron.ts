import cron from 'node-cron';
import { runAll } from './scraper-runner';

// Every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly scraper:', new Date().toISOString());
  try {
    await runAll();
  } catch (err) {
    console.error('Scheduled run error', err);
  }
});

console.log('Scrape cron started. Runs hourly at minute 0.');
