
import { createLogger, format, transports } from 'winston';
import { NODE_ENV } from '../../utils/secrets';


const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${level}: ${timestamp}: ${message} `;
})

let _transports: (transports.FileTransportInstance | transports.ConsoleTransportInstance)[] = [
  new transports.Console()
];

// if (NODE_ENV === 'production') {
//   _transports = [
//     new transports.File({ filename: './src/logs/error.log', level: "error" }), // path from the root
//     new transports.File({ filename: './src/logs/info.log', level: "info" }),
//     new transports.File({ filename: './src/logs/warn.log', level: "warn" })
//   ];
// }

const log =
  createLogger({
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.align(),
      customFormat
    ),
    transports: _transports
  })
  ;

export default log;