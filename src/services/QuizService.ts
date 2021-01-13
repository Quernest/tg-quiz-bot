import type { Context } from 'telegraf';
import type {
  ExtraPoll,
  InputFile,
  InputFileByBuffer,
  InputFileByPath,
} from 'telegraf/typings/telegram-types';
import { promises as fs } from 'fs';

function isInputFileByPath(inputFile: any): inputFile is InputFileByPath {
  return typeof (inputFile as InputFileByPath).source === 'string';
}

type Quiz = {
  question: string;
  options: string[];
  extra?: ExtraPoll & {
    open_period: number;
  };
  photo?: InputFile;
};

type QuizTopic = 'js' | 'css' | 'react';

type QuizStoreItem = {
  index: number;
  topic: QuizTopic;
  timeout?: NodeJS.Timeout | number;
};

export default class QuizService {
  store: Record<number | string, QuizStoreItem> = {};

  // @todo use QuizTopic as key
  quizzes: Record<string, Quiz[]> = {};

  async loadQuizzesByTopic(topic: QuizTopic): Promise<Quiz[]> {
    try {
      if (this.quizzes[topic]) {
        return this.quizzes[topic];
      }

      const path = `./quizzes/${topic}.json`;
      const file = await fs.readFile(path, 'utf8');
      const questions = JSON.parse(file) as Quiz[];

      this.quizzes[topic] = questions;

      return questions;
    } catch (e) {
      throw e;
    }
  }

  async startQuiz(userId: number | string, topic: QuizTopic, ctx?: Context) {
    try {
      if (!this.quizzes[topic]) {
        await this.loadQuizzesByTopic(topic);
      }

      this.store[userId] = {
        index: 0,
        topic,
      };

      if (ctx) {
        await this.sendQuiz(userId, ctx);
      }
    } catch (e) {
      throw e;
    }
  }

  async sendQuiz(userId: number | string, ctx: Context) {
    try {
      if (!this.store[userId]) {
        return ctx;
      }

      if (this.store[userId].timeout) {
        clearTimeout(this.store[userId].timeout as number);
        delete this.store[userId].timeout;
      }

      if (
        this.store[userId] &&
        this.store[userId].index ===
          this.quizzes[this.store[userId].topic].length
      ) {
        await ctx.telegram.sendMessage(userId, '🎉');
        this.store[userId].index = 0;
        return ctx;
      }

      const { question, options, extra, photo } = this.quizzes[
        this.store[userId].topic
      ][this.store[userId].index];

      this.store[userId].index++;

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

        this.store[userId].timeout = setTimeout(
          () => this.sendQuiz(userId, ctx),
          ms,
        );
      }

      return ctx;
    } catch (e) {
      throw e;
    }
  }
}
