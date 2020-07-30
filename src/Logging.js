const Log = {};

const ConsoleLogger = {
  debug: console.debug,
  log: console.log,
  warn: console.warn,
  error: console.error,
}

const LogType = ConsoleLogger;

for (let logType in LogType) {
  Log[logType] = LogType[logType];
}

export default Log;
