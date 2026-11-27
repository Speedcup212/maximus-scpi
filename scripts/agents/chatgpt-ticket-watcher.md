# ChatGPT ticket watcher (#459)

Polls GitHub issue #459 and PRs 468/467/466 every 60 seconds.
Dedupes by comment id, single-flight lock under `.local/chatgpt-watcher/`, logs `ACK` each cycle.

```bash
node scripts/agents/chatgptTicketWatcher.mjs
# prove 3 cycles ~60s apart:
WATCH_INTERVAL_MS=60000 PROVE_CYCLES=3 node scripts/agents/chatgptTicketWatcher.mjs --prove-cycles
```

State/lock/logs: `.local/chatgpt-watcher/` (gitignored via `.local/`).
Optional `GITHUB_TOKEN` for higher API rate limits; never log secrets.
