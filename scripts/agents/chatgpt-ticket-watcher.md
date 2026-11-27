# ChatGPT ticket watcher (#459)

Polls GitHub issue #459 and PRs 468/467/466 every 60 seconds.

```bash
node scripts/agents/chatgptTicketWatcher.mjs
# prove 3 cycles:
WATCH_INTERVAL_MS=60000 node scripts/agents/chatgptTicketWatcher.mjs --prove-cycles
```

State/lock/logs: `.local/chatgpt-watcher/` (gitignored locally).
No secrets required for read polling on the public repository.
