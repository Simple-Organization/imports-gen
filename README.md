# signal-factory

**signal-factory** é uma biblioteca que possui somente dois métodos `setSignalFactory` e `signalFactory`

Aqui está o código JavaScript dele compilado:

```js
var signalFactory = () => {
  throw new Error('Signal factory not set');
};
function setSignalFactory(factory) {
  signalFactory = factory;
}
export { setSignalFactory, signalFactory };
```

Tipagem de um signal

```ts
type Signal<T = any> = {
  value: T;
  subscribe: (callback: (value: T) => void) => () => void;
};
```

O **signal-factory** é usado para evitar duplicar esse código entre as [storage-versioning](https://github.com/Simple-Organization/storage-versioning), [glhera-query](https://github.com/Simple-Organization/glhera-query), [glhera-router](https://github.com/Simple-Organization/glhera-router)

O mais importante é entender o conceito por trás do **signal-factory** para evitar duplicar código na maior parte do tempo você pode simplesmente copiar o código do **signal-factory** e usá-lo

**signal-factory** faz parte da **stack do glhera**

## Configurando reatividade (signals)

Possui o método `setSignalFactory` para configurar o tipo de signal que será usado pela aplicação, podendo variar entre `Vue`, `Angular`, `SolidJS`, `PreactJS Signals`

### React

React não tem suporte nativo para signals, porém é possível usar [@preact/signals-react](https://www.npmjs.com/package/@preact/signals-react) e usar igual ao [Preact](#preact)

Aí é só usar o código abaixo

```ts
import { signal } from '@preact/signals-react';

setSignalFactory(signal);
```

### Preact

Adicionar para o preact com signals é muito simples, de onde a api foi inspirada

```ts
import { signal } from '@preact/signals';

setSignalFactory(signal);
```

Você pode usar também o hook do `signal-factory/preact` e ao invés de usar o `@preact/signals` você pode usar o `signal-factory/vanilla-atom` para criar os signals

A vantagem dessa abordagem é que ela é explícita do que atom está sendo subscrito comparado `@preact/signals`, e ele também não modifica o `render` interno do preact, podendo salvar performance em algumas circunstancias

```tsx
import { atom } from 'signal-factory/vanilla-atom';
import { useSubSignals } from 'signal-factory/preact';

setSignalFactory(atom);

//
// Depois

const counter = atom(1);

export function Component() {
  useSubSignals(() => [someAtom]);

  return <button onClick={() => counter.value++}>Count {counter.value}</button>;
}
```

### Vue

Você pode usar o wrapper usando `ref` do `signal-factory`

```ts
import { signal } from 'signal-factory/vue';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { ref, watch } from 'vue';

//
setSignalFactory(signal);

//
export function signal<T>(initial: T): Signal<T> {
  const _signal: any = ref(initial);

  _signal.subscribe = (cb: (newVal: any) => void) => {
    cb(_signal.value);
    return watch(_signal, cb);
  };

  return _signal;
}
```

### Svelte e vanilla javascript

Você pode usar o wrapper `vanilla-atom` do `signal-factory`

```ts
import { atom } from 'signal-factory/vanilla-atom';

setSignalFactory(atom);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
setSignalFactory(atom);

//

export function atom<T>(initial: T) {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}
```

### Solid

Você pode usar o wrapper `solid` do `signal-factory`

```ts
import { signal } from 'signal-factory/solid';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { createSignal } from 'solid-js';

//
setSignalFactory(signal);

//
export function signal<T>(initial: T): Signal<T> {
  let _value = initial;
  const [value, setValue] = createSignal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value();
    },
    set value(newValue) {
      _value = newValue;
      if (typeof newValue === 'function') {
        setValue(() => newValue);
      } else {
        setValue<any>(newValue);
      }

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
```

### Angular signals

Você pode usar o wrapper `angular` do `signal-factory`

```ts
import { signal } from 'signal-factory/angular';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { signal } from '@angular/core';

//
setSignalFactory(signalWrapper);

//
export function signalWrapper<T>(initial: T): Signal<T> {
  const _signal = signal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_signal());
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return _signal();
    },
    set value(newValue) {
      _signal.set(newValue);

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
```

## Testing

A api prove um `wrapper` para poder vizualizar o número de subscrições e o histórico de valores de um signal/atom

```ts
import { testWrapper } from 'signal-factory/testing';
import { atom } from 'signal-factory/vanilla-atom';

const wrapped = testWrapper(atom(1));

wrapped.value = 2;

wrapped.history; // [1, 2]

wrapped.subscribe((value) => console.log(value));

wrapped.lisCount; // 1
```
