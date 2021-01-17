import type { Context } from '../types';

export default async function inQuiz(ctx: Context, next: () => Promise<void>) {
  if (
    !ctx.session ||
    Object.keys(ctx.session).length === 0 ||
    ctx.session.step === 0
  ) {
    return next();
  }

  ctx.reply('⛔️ please, finish the current quiz first');

  return ctx;
}
