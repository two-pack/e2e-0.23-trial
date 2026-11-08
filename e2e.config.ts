import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { claudeCode } from '@e2e-dev/acp';

export default {
  targets: [{
    engine: web(),
    app: {
      // Port 0 takes a free port, and {port} passes it to the command.
      url: 'http://127.0.0.1:0',
      command: {
        executable: 'node',
        args: ['app/server.js', '{port}'],
        log: '.e2e/logs/app.log',
      },
    },
  }],
  agents: { default: { executor: claudeCode({ model: 'sonnet' }) } },
} satisfies E2EConfig;
