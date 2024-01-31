import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${level}: ${timestamp}: ${message} `;
})
const log =
  createLogger({
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.align(),
      customFormat
    ),
    transports: [
      // new transports.File({ filename: './src/logs/error.log', level: 'error' }), // path from the root
      // new transports.File({ filename: './src/logs/info.log', level: 'info' }),
      // new transports.File({ filename: './src/logs/warn.log', level: 'warn' }),
      new transports.Console()
    ]
  })
  ;

export default log;
