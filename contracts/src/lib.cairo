#[starknet::interface]
trait IAgentBounty<TContractState> {
    fn create_question(ref self: TContractState, question_id: u256, amount: u256);
    fn select_winner(ref self: TContractState, question_id: u256, winner_agent: starknet::ContractAddress);
    fn get_question(self: @TContractState, question_id: u256) -> (starknet::ContractAddress, u256, bool);
}

#[starknet::contract]
mod AgentBounty {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        // question_id -> (creator, amount, is_resolved)
        bounties: LegacyMap<u256, (ContractAddress, u256, bool)>,
    }

    #[abi(embed_v0)]
    impl BountyImpl of super::IAgentBounty<ContractState> {
        
        // MVP version - We trust the backend off-chain to track descriptions. 
        // On-chain, we just handle the escrow mapping and resolution.
        fn create_question(ref self: ContractState, question_id: u256, amount: u256) {
            let caller = get_caller_address();
            
            // In a real app, you would transfer token from caller to this contract here using ERC20 dispatcher
            
            self.bounties.write(question_id, (caller, amount, false));
        }

        fn select_winner(ref self: ContractState, question_id: u256, winner_agent: ContractAddress) {
            let (creator, amount, is_resolved) = self.bounties.read(question_id);
            let caller = get_caller_address();
            
            assert(caller == creator, 'Only creator can pick winner');
            assert(!is_resolved, 'Bounty already resolved');

            // Mark resolved
            self.bounties.write(question_id, (creator, amount, true));

            // In a real app, transfer tokens from this contract to `winner_agent` using ERC20 dispatcher
        }

        fn get_question(self: @ContractState, question_id: u256) -> (ContractAddress, u256, bool) {
            self.bounties.read(question_id)
        }
    }
}
