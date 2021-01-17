import type { InputFileByBuffer } from 'telegraf/typings/telegram-types';
import { promises as fs } from 'fs';

import type { Context, Quiz } from '../types';
import { isInputFileByPath } from '../utils';
import logger from '../logger';

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

      ctx.session = {
        step: 0,
        skipped: 0,
        correct: 0,
        incorrect: 0,
        topic,
      };

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
        logger.info(`${userId}`, ctx.session);
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
        ctx.session.timeout = setTimeout(() => {
          // @ts-ignore
          ctx.session.skipped++;
          this.sendQuiz(userId, ctx);
        }, ms);
      }

      return ctx;
    } catch (e) {
      throw e;
    }
  }

  async handlePollAnswer(ctx: Context) {
    try {
      if (!ctx.pollAnswer) {
        return ctx;
      }

      const { id } = ctx.pollAnswer.user;

      if (ctx.session?.topic) {
        const quizzes = this.quizzes.get(ctx.session.topic);

        if (quizzes) {
          const quiz = quizzes[ctx.session.step - 1];

          if (quiz) {
            const {
              extra: { correct_option_id: correctOptionId },
            } = quiz;
            const [currentOptionId] = ctx.pollAnswer.option_ids;

            if (currentOptionId === correctOptionId) {
              ctx.session.correct++;
            } else {
              ctx.session.incorrect++;
            }
          }
        }
      }

      await this.sendQuiz(id, ctx);

      return ctx;
    } catch (e) {
      throw e;
    }
  }

  async handleStartQuiz(ctx: Context, topic: string) {
    try {
      const id = ctx.message?.chat?.id as number;
      await this.startQuiz(id, topic, ctx);
      return ctx;
    } catch (e) {
      throw e;
    }
  }
}
