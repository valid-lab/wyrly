import { createContainer, token } from "@wyrly/core";

interface Greeter {
  greet(name: string): string;
}

const GreeterToken = token<Greeter>("Greeter");

class ConsoleGreeter implements Greeter {
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

class WelcomeService {
  constructor(private readonly greeter: Greeter) {}

  welcome(name: string): string {
    return this.greeter.greet(name);
  }
}

const container = createContainer();

container.register(GreeterToken, {
  useClass: ConsoleGreeter,
  lifetime: "singleton",
});

// No decorator: explicit deps at register time
container.register(WelcomeService, {
  useClass: WelcomeService,
  deps: [GreeterToken],
  lifetime: "singleton",
});

const message = container.resolve(WelcomeService).welcome("Wyrly");
console.log(message);
