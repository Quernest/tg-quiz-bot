import type { InputFileByBuffer } from 'telegraf/typings/telegram-types';
import { promises as fs } from 'fs';

import type { Context, Quiz } from '../types';
import { isInputFileByPath } from '../utils';

export default class QuizService {
  quizzes: Map<string, Quiz[]> = new Map();

  async getQuizzesByTopic(topic: string): Promise<Quiz[]> {
    try {
      if (this.quizzes.has(topic)) {
        return this.quizzes.get(topic) as Quiz[];
      }

      const path = `./quizzes/${topic}.json`;
      const file = await fs.readFile(path, 'utf8');
      const questions = JSON.parse(file) as Quiz[];

      this.quizzes.set(topic, questions);

      return questions;
    } catch (e) {
      throw e;
    }
  }

  async startQuiz(userId: number | string, topic: string, ctx: Context) {
    try {
      await this.getQuizzesByTopic(topic);
      ctx.session = { step: 0, topic };
      await this.sendQuiz(userId, ctx);
    } catch (e) {
      throw e;
    }
  }

  async sendQuiz(userId: number | string, ctx: Context) {
    try {
      if (!ctx.session) {
        return ctx;
      }

      if (ctx.session.timeout) {
        clearTimeout(ctx.session.timeout);
        delete ctx.session.timeout;
      }

      const quizzes = this.quizzes.get(ctx.session.topic);

      if (!quizzes) {
        return ctx;
      }

      if (ctx.session.step === quizzes.length) {
        await ctx.telegram.sendMessage(userId, '🎉');
        ctx.session.step = 0;
        return ctx;
      }

      const { question, options, extra, photo } = quizzes[ctx.session.step];

      ctx.session.step++;

      await ctx.telegram.sendQuiz(userId, question, options, {
        ...extra,
        is_anonymous: false,
      });

      if (typeof photo === 'object') {
        let newPhoto = { ...photo };

        if (isInputFileByPath(photo)) {
          const source = await fs.readFile(photo.source);
          (newPhoto as InputFileByBuffer).source = source;
        }

        await ctx.telegram.sendPhoto(userId, newPhoto, {
          disable_notification: true,
        });
      }

      if (extra && extra.open_period) {
        const ms = extra.open_period * 1000;
        ctx.session.timeout = setTimeout(() => this.sendQuiz(userId, ctx), ms);
      }

      return ctx;
    } catch (e) {
      throw e;
    }
  }
}
