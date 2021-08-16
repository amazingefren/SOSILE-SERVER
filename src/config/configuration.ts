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
  saltRounds: number;
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
    url: process.env.URL,
  },
  auth: {
    atSecret: process.env.AT_SECRET,
    rtSecret: process.env.RT_SECRET,
    saltRounds: Number(process.env.SALT_ROUNDS),
    cookieSecret: process.env.COOKIE_SECRET,
  },
};

export default () => config;
