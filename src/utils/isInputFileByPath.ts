import type { InputFileByPath } from 'telegraf/typings/telegram-types';

export default function isInputFileByPath(
  inputFile: any,
): inputFile is InputFileByPath {
  return typeof (inputFile as InputFileByPath).source === 'string';
}
