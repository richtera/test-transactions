const {
  setLengthLeft,
  stripHexPrefix,
  ecrecover,
  publicToAddress,
  bufferToHex,
  keccak256,
  rlp,
} = require("ethereumjs-util");
const { toDecimal, toBN } = require("web3-utils");
const {
  ecdsaVerify,
  ecdsaRecover,
  publicKeyConvert,
} = require("ethereum-cryptography/secp256k1-compat");

function testTransaction(name, transaction) {
  console.log(`\n----\nChecking ${name}\n----`)
  const transData = Buffer.from(stripHexPrefix(transaction), "hex");
  const transComps = rlp.decode(transData.slice(1));
  const [
    chain_id,
    signer_nonce,
    max_priority_fee_per_gas,
    max_fee_per_gas,
    gas_limit,
    destination,
    amount,
    payload,
    access_list,
    signature_y_parity_,
    signature_r,
    signature_s,
  ] = transComps;
  const unsignedComps = transComps.slice(0, transComps.length - 3);
  const signedHash = Uint8Array.from(keccak256(transData));
  const unsignedHash = Uint8Array.from(
    keccak256(Buffer.concat([Uint8Array.from([2]), rlp.encode(unsignedComps)]))
  );

  const signature_y_parity = toBN(bufferToHex(signature_y_parity_));
  console.log("signedHash", bufferToHex(signedHash));
  console.log("unsignedHash", bufferToHex(unsignedHash));

  console.log("v", toDecimal(signature_y_parity));
  console.log("r", bufferToHex(signature_r));
  console.log("s", bufferToHex(signature_s));

  const signature = Buffer.concat(
    [setLengthLeft(signature_r, 32), setLengthLeft(signature_s, 32)],
    64
  );

  function calculateSigRecovery(v, chainId) {
    const vBN = toBN(v);
    if (vBN.eqn(0) || vBN.eqn(1)) return vBN;
    if (!chainId) {
      return vBN.subn(27);
    }
    const chainIdBN = toBN(chainId);
    return vBN.sub(chainIdBN.muln(2).addn(35));
  }

  function isValidSigRecovery(recovery) {
    const rec = toBN(recovery);
    return rec.eqn(0) || rec.eqn(1);
  }

  const recovery = calculateSigRecovery(signature_y_parity, chain_id);
  if (!isValidSigRecovery(recovery)) {
    throw new Error("Invalid signature v value");
  }

  const senderPubKey = Buffer.from(
    ecdsaRecover(signature, recovery.toNumber(), unsignedHash)
  );
  const publicKey = Buffer.from(publicKeyConvert(senderPubKey, false)).slice(1);

  console.log("publicKey", bufferToHex(publicKey));
  const pub = publicToAddress(publicKey);
  console.log("publicAddress", bufferToHex(pub));

  const output = ecdsaVerify(
    signature,
    unsignedHash,
    Buffer.concat([Buffer.from(Uint8Array.from([4])), publicKey])
  );
  console.log("valid", output);
}

testTransaction(
  "metamask",
  "0x02f88f820b0c188459682f008459682f0882f5bf8080b73d602d80600a3d3981f3363d3d373d3d3d363d73e5ac59a841a996f93d97d52f067467c560a334a45af43d82803e903d91602b57fd5bf3c001a07ea272e9ddcc3b65c76475b7fdafc3d43f05a8843011baa043d2d5e6a5d6bd66a075c3bb33cd45edc8cce6e428372ddc85c1d7dd9712959fe8360338567f0abb4e"
);
testTransaction(
  "up",
  "0x02f88f820b0c298459682f008459682f0882f5bf8080b73d602d80600a3d3981f3363d3d373d3d3d363d73e5ac59a841a996f93d97d52f067467c560a334a45af43d82803e903d91602b57fd5bf3c080a043d2e0a90aeb8448f0346b049b426f8d52f9b65fc88b652277e62e75183f67e0a00dd7f687de523de0cbcde763dfe2f9235c5fcfe77e009ce22e71791f625ca458"
);
