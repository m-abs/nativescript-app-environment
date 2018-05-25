# nativescript-app-environment

### Add environment variables into your app from the nativescript-cli

Creates `app/environment.json` from the nativescript-cli command via argv `--env.app`

### Install
```bash
tns plugin add nativescript-app-environment
```

### Usage

* Set production mode in tns run:
  ```bash
    tns run android --env.app.prod
  ```

  This will create `environment.json` with this content:
  ```typescript
  { prod: true }
  ```

* in app
  ```typescript
  const { environment } = require('./environment.json');

  console.log(environment);
  ```

* Inspired by [nativescript-hook-debug-production](https://github.com/markosko/nativescript-hook-debug-production)
