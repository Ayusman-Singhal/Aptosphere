module aptosphere::social_media {
    use std::string::String;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    struct Post has key, store {
        id: u64,
        content: String,
        author: address,
        timestamp: u64,
        likes: u64,
    }

    struct UserProfile has key {
        posts: vector<Post>,
        post_count: u64,
        following: vector<address>,
    }

    struct AptosphereState has key {
        total_posts: u64,
    }

    fun init_module(account: &signer) {
        move_to(account, AptosphereState { total_posts: 0 });
    }

    public entry fun create_profile(account: &signer) {
        let user_address = account::get_address(account);
        if (!exists<UserProfile>(user_address)) {
            move_to(account, UserProfile {
                posts: vector::empty(),
                post_count: 0,
                following: vector::empty(),
            });
        }
    }

    public entry fun create_post(account: &signer, content: String) acquires UserProfile, AptosphereState {
        let user_address = account::get_address(account);
        assert!(exists<UserProfile>(user_address), 1); // Error code 1: Profile doesn't exist

        let state = borrow_global_mut<AptosphereState>(@aptosphere);
        let post_id = state.total_posts + 1;
        state.total_posts = post_id;

        let profile = borrow_global_mut<UserProfile>(user_address);
        let new_post = Post {
            id: post_id,
            content,
            author: user_address,
            timestamp: timestamp::now_seconds(),
            likes: 0,
        };

        vector::push_back(&mut profile.posts, new_post);
        profile.post_count = profile.post_count + 1;
    }

    public entry fun like_post(account: &signer, author: address, post_id: u64) acquires UserProfile {
        let _user_address = account::get_address(account);
        assert!(exists<UserProfile>(author), 1); // Error code 1: Profile doesn't exist

        let profile = borrow_global_mut<UserProfile>(author);
        let post = vector::borrow_mut(&mut profile.posts, post_id - 1);
        post.likes = post.likes + 1;
    }

    #[view]
    public fun get_posts(user_address: address): vector<Post> acquires UserProfile {
        assert!(exists<UserProfile>(user_address), 1); // Error code 1: Profile doesn't exist
        let profile = borrow_global<UserProfile>(user_address);
        profile.posts
    }
}