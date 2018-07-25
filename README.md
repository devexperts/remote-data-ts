# RemoteData type [![Build Status](https://travis-ci.org/devex-web-frontend/remote-data-ts.svg?branch=master)](https://travis-ci.org/devex-web-frontend/remote-data-ts)
### Description
RemoteData is an ADT (algebraic data type) described in [this article](https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b). Heavily based on [fp-ts](https://github.com/gcanti/fp-ts) lib.

### Installation
`npm i --save @devexperts/remote-data-ts`

### How to lift (wrap) your data in RemoteData:
As you remember RemoteData is an union of few types: `RemoteInitial`, `RemotePending`, `RemoteFailure` and `RemoteSuccess`.

While your data in **initial** or **pending** state just use `initial` or `pending` constant, because you don't have any **real** values in this case.

```ts
import { initial, pending } from '@devexperts/remote-data-ts';

const customers = initial;
// or
const customers = pending;
```

When you receive data from server, use `failure` or `success` function, it depends on what you received:

```ts
import { failure, success } from '@devexperts/remote-data-ts';
import { apiClient } from 'apiClient';
import { TCustomer } from './MyModel';

const getCustomers = (): RemoteData<TCustomer[]> => {
   const rawData: TCustomer[] = apiClient.get('/customers');

   try {
        const length = rawData.length;

        return success(rawData);
   }
   catch(err) {
        return failure(new Error('parse error'));
   }
}
```

### How to fold (unwrap) your data from RemoteData:
Finally you pass data to the component and want to render values, so now it's time to get our values back from RemoteData wrapper:

```ts
import { NoData, Pending, Failure } from './MyPlaceholders';
import { TCustomer } from './MyModel';

type TCustomersList = {
    entities: RemoteData<TCustomer[]>;
};

const CustomersList: SFC<TCustomersList> = ({ entities }) => entities.foldL(
    () => <NoData />,
    () => <Pending />,
    err => <Failure error={err} />,
    data => <ul>{data.map(item => <li>{item.name}</li>)}</ul>
);
```

### Docs & Examples
Coming soon (check the [source](src/remote-data.ts))
