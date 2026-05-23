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
  deps: [],
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
  deps: [ConfigToken, LoggerAliasToken],
  useFactory: (_scope, config, logger) => {
    const c = config as { apiUrl: string };
    const l = logger as Logger;
    return {
      baseUrl: c.apiUrl,
      log: (msg: string) => l.log(`api: ${msg}`),
    };
  },
  lifetime: "singleton",
});

const client = container.resolve(ApiClientToken);
console.log("baseUrl:", client.baseUrl);
client.log("ready");
