export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const telegram = {
  token: process.env.TG_TOKEN as string,
};

export const logging = {
  level: process.env.LOG_LEVEL || 'info',
};

export const env = {
  dev: process.env.NODE_ENV === 'development',
  prod: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test',
};
