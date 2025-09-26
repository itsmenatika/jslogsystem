# [HOME](../home.md)/[exp](./index.md)/[keepProcessAlive](./keepProcessAlive.md)

## usage

basic:
```typescript
keepProcessAlive();
```

example:
```typescript
import { keepProcessAlive } from "./logSystem";


// it will keep the process alive even though there's no reason for it to be kept alive
keepProcessAlive();
```

## compatibility

available for: 1.1+

> [!IMPORTANT]
> resolveTime argument is available only for 1.171+

## what it does?

It creates a fake async function that keeps the current process running. It's useful for tasking if you don't want to load your entire application or if you want to run the log System standalone.

Internal implemention currently looks like this:
```typescript
/**
 * allows you to create a fake loop to keep the process alive. It was used mostly for testing
 */
function keepProcessAlive(resolveTime: number = 20){
    (async () => {
        while(true){
            await new Promise((resolve) => setTimeout(resolve, resolveTime));
        }
    })();
}
```