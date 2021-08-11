export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production';
};
export interface DevelopmentConfig {
  logLevel: 'log'|'error'|'warn'|'debug'|'verbose';
  graphiql: boolean;
}
export interface DatabaseConfig{
  name: string;
  host: string;
  user: string;
  password: string;
  port: string;
}
export interface AuthConfig{
  atSecret: string; 
  rtSecret: string;
  saltRounds: string;
  cookieSecret: string;
}

const config = {
  server: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  development: {
    logLevel: process.env.LOG_LEVEL || 'error',
    graphiql: Boolean(process.env.ENABLE_GRAPHIQL) || false,
  },
  database: {
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  },
  auth: {
    atSecret: process.env.AT_SECRET,
    rtSecret: process.env.RT_SECRET,
    saltRounds: process.env.SALT_ROUNDS,
    cookieSecret: process.env.COOKIE_SECRET,
  },
};

export default () => config;
