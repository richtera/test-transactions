
# Small Test

Decode two binary transactions and validate their signatures.

# Run

```sh
npm i
node test.js
```

# Simple test

New transaction tests can be added into the code by just copying the hex of the transaction.

```js
testTransaction(
  "up",
  "0x02f88f820b0c298459682f008459682f0882f5bf8080b73d602d80600a3d3981f3363d3d373d3d3d363d73e5ac59a841a996f93d97d52f067467c560a334a45af43d82803e903d91602b57fd5bf3c080a043d2e0a90aeb8448f0346b049b426f8d52f9b65fc88b652277e62e75183f67e0a00dd7f687de523de0cbcde763dfe2f9235c5fcfe77e009ce22e71791f625ca458"
);
```