import {newConsole} from "./logSystem";

newConsole.count("test");
newConsole.warn("test", "himek");
newConsole.logThis(newConsole.LogType.INFO, "test");
newConsole.logThis(newConsole.LogType.WARNING, "test", "niehimek");
newConsole.count("test");