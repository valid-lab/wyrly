import { createContainer, token } from "@wyrly/core";

const ConfigToken = token<{ apiUrl: string }>("Config");

interface Logger {
  log(message: string): void;
}

const LoggerToken = token<Logger>("Logger");
const LoggerAliasToken = token<Logger>("LoggerAlias");

const ApiClientToken = token<{ baseUrl: string; log(msg: string): void }>("ApiClient");

const container = createContainer();

// useValue
container.register(ConfigToken, {
  useValue: { apiUrl: "https://api.example.test" },
});

// useFactory
container.register(LoggerToken, {
  useFactory: () => ({
    log(message: string) {
      console.log(`[log] ${message}`);
    },
  }),
  lifetime: "singleton",
});

container.register(LoggerAliasToken, {
  useExisting: LoggerToken,
  lifetime: "singleton",
});

container.register(ApiClientToken, {
  useFactory: (scope) => {
    const config = scope.resolve(ConfigToken);
    const logger = scope.resolve(LoggerAliasToken);
    return {
      baseUrl: config.apiUrl,
      log: (msg: string) => logger.log(`api: ${msg}`),
    };
  },
  deps: [ConfigToken, LoggerToken],
  lifetime: "singleton",
});

const client = container.resolve(ApiClientToken);
console.log("baseUrl:", client.baseUrl);
client.log("ready");
