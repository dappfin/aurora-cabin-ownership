pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleProof() {
    // Public inputs
    signal input root[32];
    signal input nullifier[32];
    signal input secret[32];
    signal input path_elements[8][32];
    signal input path_indices[8];
    
    // Private inputs
    signal input leaf_secret;
    signal input leaf_nullifier;
    
    // Intermediate signals
    signal hash[32];
    signal path_hash[32];
    signal computed_nullifier[32];
    
    // Poseidon hash function
    component poseidon = Poseidon(2);
    
    // Compute leaf hash from secret and nullifier
    hash <== poseidon([leaf_secret, leaf_nullifier])[0];
    
    // Verify Merkle path
    path_hash[0] <== root;
    for (var i = 0; i < 8; i++) {
        // Compute hash of current path element
        path_hash[i + 1] <== poseidon([path_hash[i], path_elements[i]])[0];
        
        // Check if we need to use the current path element
        signal is_right = path_indices[i];
        path_hash[i + 1] <== is_right ? path_hash[i + 1] : poseidon([path_hash[i + 1], path_elements[i]])[0];
    }
    
    // Final hash should match the computed leaf hash
    signal is_valid = path_hash[8] == hash;
    
    // Compute nullifier hash to prevent double-spending
    computed_nullifier <== poseidon([leaf_nullifier, secret])[0];
    
    // Verify nullifier matches
    signal nullifier_valid = computed_nullifier == nullifier;
    
    // Overall proof validity
    signal proof_valid = is_valid & nullifier_valid;
    
    // Output signals
    output proof_valid;
    output nullifier;
}
