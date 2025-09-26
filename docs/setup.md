# [HOME](home.md)/[setup](setup.md)

> [!NOTE]
> Currently, there's no correct way to unload it.

> [!IMPORTANT]
> remember to use the correct import path!

> [!TIP]
> It's recommended to use only one system at the time (let it be either standard ESM MODULES or node.js modules)

> [!TIP]
> it's recommended to use standard JS modules.

> [!WARNING]
> function keepProcessAlive() creates a fake async task that sole purpose is to keep your application running. Don't use it if your application already has something to do as it may slightly impact your performance!

To start working with log system you can use that minimal setup that will work out of the box:

### standard JS module system (ESM modules):

```typescript
import { keepProcessAlive } from "./logSystem";


// it will keep the process alive even though there's no reason for it to be kept alive
keepProcessAlive();
```

### commonJS node.js system

```typescript
const logSystem = require("./logSystem");

logSystem.keepProcessAlive();
```

It will allow you to test it standalone without even your application and use every built-in function.
