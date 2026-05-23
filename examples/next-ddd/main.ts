import { createAppContainer } from "./composition/container.ts";
import { createRouteHandler, testNextRequest } from "./presentation/route_handler.ts";
import { createUpdateUserAction } from "./presentation/server_action.ts";
import { createServerComponentDemo } from "./presentation/server_component.ts";

export const container = createAppContainer();

if (import.meta.main) {
  const routeHandler = createRouteHandler(container);
  const routeRes = await routeHandler(testNextRequest(), { params: { id: "user-1" } });
  console.log("Route Handler:", routeRes.status, await routeRes.json());

  const action = createUpdateUserAction(container);
  const form = new FormData();
  form.set("userId", "user-1");
  const actionResult = await action(form);
  console.log("Server Action:", actionResult);

  const loadPage = createServerComponentDemo(container);
  const page = await loadPage("user-1");
  console.log("Server Component:", page);
}
