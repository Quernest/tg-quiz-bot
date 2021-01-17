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

  bot.command('quiz', (ctx) =>
    ctx.reply('✨ choose a topic:', {
      reply_markup: Markup.keyboard([['/css', '/js', '/react']])
        .oneTime()
        .resize(),
    }),
  );

  bot.on('poll_answer', async (ctx) => await quiz.handlePollAnswer(ctx));

  bot.command(
    'css',
    inQuiz,
    async (ctx) => await quiz.handleStartQuiz(ctx, 'css'),
  );

  bot.command(
    'js',
    inQuiz,
    async (ctx) => await quiz.handleStartQuiz(ctx, 'js'),
  );

  bot.command(
    'react',
    inQuiz,
    async (ctx) => await quiz.handleStartQuiz(ctx, 'react'),
  );

  return bot;
}
