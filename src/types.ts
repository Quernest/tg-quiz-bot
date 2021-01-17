import type { Context as BaseContext } from 'telegraf';
import type { ExtraPoll, InputFile } from 'telegraf/typings/telegram-types';

export type Quiz = {
  question: string;
  options: string[];
  extra?: ExtraPoll & {
    open_period: number;
  };
  photo?: InputFile;
};

export interface SessionData {
  step: number;
  topic: string;
  timeout?: NodeJS.Timeout;
}

export interface Context extends BaseContext {
  session?: SessionData;
}
