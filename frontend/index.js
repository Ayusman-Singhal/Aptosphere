const { AptosClient, AptosAccount, FaucetClient } = require("aptos");

// Define the node URL and faucet URL
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

// Create instances of the required clients
const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

async function main() {
  // Create a new account
  const account = new AptosAccount();
  
  // Fund the account using the faucet
  await faucetClient.fundAccount(account.address(), 100_000_000);
  
  console.log("Account address:", account.address().hex());
  
  // Check the account balance
  const resources = await client.getAccountResources(account.address());
  const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
  const balance = parseInt(accountResource.data.coin.value);
  console.log(`Account balance: ${balance}`);

  // You can add more interactions with your Aptosphere contract here
}

main().then(() => console.log("Done!")).catch((error) => console.error(error));
