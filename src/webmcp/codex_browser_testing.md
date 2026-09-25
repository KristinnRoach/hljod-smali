# WebMCP testing

### Unsupported models

`gpt-5.6-luna does not support command "webmcp_list_tools"`, even when the
`webmcp` capability is advertised. Confirmed blocked at 2026-09-25.
Do not infer restrictions for other models or repeat compatibility research
unless asked. If other blocked models are discovered, list them here.

- Leave the user-managed dev server alone unless asked to manage it.
- Prefer Codex's in-app browser (`iab`). Edge's tested connection lacked
  `webmcp` despite its enabled browser flag. Do not retry Edge unless requested
  or its advertised capabilities have changed.
- Use the documented browser interface below. `fetchTools()` internally calls
  `webmcp_list_tools`; an error naming it does not imply incorrect API usage.

```js
const webmcp = await tab.capabilities.get('webmcp');
const tools = await webmcp.fetchTools();
// Read tools.description() if no notification lists the page tools.
await tools.call('inspect_sampler', {});
```

- Call only listed tools. On missing capability or unsupported-command errors,
  stop and report the model/error. Do not try alternate wrappers, research
  workarounds, or change app code/browser flags unless asked.
- Before playing notes, require `ready: true` and `audioContextState: "running"`.
  If needed, try one browser-automation click on "Click to start", then inspect
  again. If still blocked, report it. That click alone remains unverified.
- `document.body.click()` inside an `init_audio` tool failed, even with a
  one-second wait. Do not repeat it or add activation logic to each tool.
