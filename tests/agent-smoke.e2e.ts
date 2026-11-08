import { test } from '@e2e-dev/web';

test('agent sees the todo form', async ({ app, agent }) => {
  await app.open('/');
  await agent.assert('a todo form with a "New todo" input and an Add button is shown');
});
