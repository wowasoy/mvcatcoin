try {
  const write = wallet.writeContract as (p: unknown) => Promise<Hash>;
  const hash: Hash = await write({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: fn,
    args,
    account,
    chain: wallet.chain,
  });
  setStatus(`${fn} tx: ${hash}`);
} catch (err) {
  setStatus(`${fn} error: ${extractMessage(err)}`);
}