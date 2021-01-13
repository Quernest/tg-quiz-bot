import * as express from 'express';
import Telegraf from 'telegraf';

import { port, telegram } from './config';
import createBot from './bot';
import logger from './logger';

async function start() {
  const server = express();
  const bot = await createBot(new Telegraf(telegram.token));

  server.get('/health', async (req, res) => {
    try {
      res.send('ok');
    } catch (err) {
      res.status(500);
    }
  });

  server.listen(port, async () => {
    logger.info(`Server listening on port ${port}`);
    await bot.launch();
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
}

start();
