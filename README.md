[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

# mobx-observer.macro

> This is a Babel macro that requires the `babel-plugin-macros` to run inside your build pipeline. For more information on how to set up Babel macros, visit its homepage: https://github.com/kentcdodds/babel-plugin-macros

A Babel macro to banish HOCs. This macro will transform the `observer` HOC for MobX into a "custom hook", allowing you to benefit from having an observer component without using an HOC or a decorator. This currently only supports function components.

See this Codesandbox for the macro in action: https://codesandbox.io/s/mobx-observermacro-4b8zg

## Usage

Say your file looks like this:

```js
import React from "react";
import Store from "./store";
import { observer } from "mobx-react-lite";

export const MyObserver = observer((props) => {
  return <div>{store.message}</div>;
});
```

You can now write it like this:

```js
import React from "react";
import Store from "./store";
import useObserver from "mobx-observer.macro";

export function MyObserver(props) {
  useObserver();
  return <div>{store.message}</div>;
}
```

And it will turn the source code into what it looks like in the first example!
