import * as winston from 'winston';

import { env, logging } from './config';

const logger = winston.createLogger({
  level: logging.level,
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

if (env.test && logging.level !== 'debug') {
  logger.remove(winston.transports.Console);
}

export default logger;
