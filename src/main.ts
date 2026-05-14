// Some third-party libs assume a Node-like global variable.
// Define it once for the browser to avoid runtime crashes like "global is not defined".
(globalThis as unknown as { global?: unknown }).global ??= globalThis;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
