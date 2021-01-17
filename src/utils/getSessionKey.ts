import type { Context } from '../types';

export default function getSessionKey(ctx: Context): string {
  const { chat, pollAnswer, from } = ctx;

  if (!from && chat?.type === 'private') {
    return `${chat.id}${chat.id}`;
  }

  if (pollAnswer?.user.id) {
    return `${pollAnswer.user.id}:${pollAnswer.user.id}`;
  }

  if (from?.id) {
    return `${from.id}:${from.id}`;
  }

  return ':';
}
