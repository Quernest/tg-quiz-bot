import type { Telegraf, Context } from 'telegraf';
import { Markup } from 'telegraf';

import { QuizService } from './services';

export default async function createBot(
  bot: Telegraf<Context>,
): Promise<Telegraf<Context>> {
  const quiz = new QuizService();

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

  bot.command('css', async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'css', ctx);
    return ctx;
  });

  bot.command('js', async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'js', ctx);
    return ctx;
  });

  bot.command('react', async (ctx) => {
    const id = ctx.message?.chat?.id as number;
    await quiz.startQuiz(id, 'react', ctx);
    return ctx;
  });

  return bot;
}
