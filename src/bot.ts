import type { Telegraf } from 'telegraf';
import { Markup, session } from 'telegraf';

import { Context } from './types';
import { QuizService } from './services';
import { inQuiz } from './middlewares';
import { getSessionKey } from './utils';

export default async function createBot(
  bot: Telegraf<Context>,
): Promise<Telegraf<Context>> {
  const quiz = new QuizService();

  bot.use(session({ getSessionKey }));

  bot.start((ctx) => ctx.reply('supported commands: /quiz'));

  bot.command('quiz', (ctx) => {
    ctx.reply('✨ choose a topic:', {
      reply_markup: Markup.keyboard([['/css', '/js', '/react']])
        .oneTime()
        .resize(),
    });
  });

  bot.on('poll_answer', async (ctx) => {
    const id = ctx.pollAnswer?.user.id as number;
    await quiz.sendQuiz(id, ctx);
    return ctx;
  });

  bot.command('css', inQuiz, async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'css', ctx);
    return ctx;
  });

  bot.command('js', inQuiz, async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'js', ctx);
    return ctx;
  });

  bot.command('react', inQuiz, async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'react', ctx);
    return ctx;
  });

  return bot;
}
