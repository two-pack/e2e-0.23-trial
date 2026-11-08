import { test } from '@e2e-dev/web';

test('adds a todo', async ({ app, agent }) => {
  await app.open('/');
  await agent.act('add a todo named {title}', { params: { title: 'Buy milk' } });
  await agent.assert('"Buy milk" is listed and the count shows "1 todo"');
});

test('rejects an empty title', async ({ app, agent }) => {
  await app.open('/');
  await agent.act('press Add without typing a title');
  await agent.assert('the error "Title is required" is shown and no todo is listed');
});
