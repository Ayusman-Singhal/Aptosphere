import React, { useState, useEffect } from 'react';
import { AptosClient, AptosAccount, FaucetClient } from 'aptos';

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com';
const FAUCET_URL = 'https://faucet.devnet.aptoslabs.com';

const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// Define the Post interface
interface Post {
  content: string;
  author: string;
}

function App() {
  const [account, setAccount] = useState<AptosAccount | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    const initAccount = async () => {
      try {
        const newAccount = new AptosAccount();
        await faucetClient.fundAccount(newAccount.address(), 100_000_000);
        setAccount(newAccount);
      } catch (error) {
        console.error('Error initializing account:', error);
      }
    };

    initAccount();
  }, []);

  const createProfile = async () => {
    if (!account) return;

    const payload = {
      type: 'entry_function_payload',
      function: `${process.env.REACT_APP_CONTRACT_ADDRESS}::social_media::create_profile`,
      type_arguments: [],
      arguments: []
    };

    try {
      const txnRequest = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
      console.log('Profile created successfully');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const createPost = async () => {
    if (!account) return;

    const payload = {
      type: 'entry_function_payload',
      function: `${process.env.REACT_APP_CONTRACT_ADDRESS}::social_media::create_post`,
      type_arguments: [],
      arguments: [newPostContent]
    };

    try {
      const txnRequest = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
      setNewPostContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const fetchPosts = async () => {
    if (!account) return;

    const payload = {
      function: `${process.env.REACT_APP_CONTRACT_ADDRESS}::social_media::get_posts`,
      type_arguments: [],
      arguments: [account.address().hex()]
    };

    try {
      const response = await client.view(payload);
      
      // Log the response to inspect its structure
      console.log('Fetched response:', response);
      
      // Handle different possible response structures
      if (Array.isArray(response) && Array.isArray(response[0])) {
        const fetchedPosts: Post[] = response[0].map((post: any) => ({
          content: post.content || 'No content',
          author: post.author || 'Unknown author'
        }));
        setPosts(fetchedPosts);
      } else if (typeof response === 'string') {
        console.error('Unexpected response format: Received string');
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  return (
    <div className="App">
      <h1>Aptosphere</h1>
      {account && (
        <div>
          <p>Your address: {account.address().hex()}</p>
          <button onClick={createProfile}>Create Profile</button>
          <input 
            type="text" 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?" 
          />
          <button onClick={createPost}>Post</button>
          <button onClick={fetchPosts}>Refresh Posts</button>
          <div>
            {posts.map((post, index) => (
              <div key={index}>
                <p>{post.content}</p>
                <small>By: {post.author}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
