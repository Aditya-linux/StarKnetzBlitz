#[starknet::interface]
trait IAgentBounty<TContractState> {
    fn create_question(ref self: TContractState, question_id: u256, amount: u256);
    fn select_winner(ref self: TContractState, question_id: u256, winner_agent: starknet::ContractAddress);
    fn distribute_rewards(
        ref self: TContractState, 
        question_id: u256, 
        agents: Array<starknet::ContractAddress>, 
        agent_reward: u256
    );
    fn get_question(self: @TContractState, question_id: u256) -> (starknet::ContractAddress, u256, bool);
}

#[starknet::contract]
mod AgentBounty {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        // question_id -> (creator, amount, is_resolved)
        bounties: LegacyMap<u256, (ContractAddress, u256, bool)>,
        token_address: ContractAddress,
        owner_address: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, token_address: ContractAddress, owner_address: ContractAddress) {
        self.token_address.write(token_address);
        self.owner_address.write(owner_address);
    }

    #[abi(embed_v0)]
    impl BountyImpl of super::IAgentBounty<ContractState> {
        
        fn create_question(ref self: ContractState, question_id: u256, amount: u256) {
            let caller = get_caller_address();
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            
            // Transfer tokens from caller to this contract (requires allowance)
            token.transfer_from(caller, get_contract_address(), amount);
            
            self.bounties.write(question_id, (caller, amount, false));
        }

        fn select_winner(ref self: ContractState, question_id: u256, winner_agent: ContractAddress) {
            let (creator, amount, is_resolved) = self.bounties.read(question_id);
            let caller = get_caller_address();
            
            assert(caller == creator, 'Only creator can pick winner');
            assert(!is_resolved, 'Bounty already resolved');

            // Mark resolved
            self.bounties.write(question_id, (creator, amount, true));

            // Transfer full bounty to the winner (legacy single-winner mode)
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.transfer(winner_agent, amount);
        }

        /// Distribute rewards: each agent gets `agent_reward`, remainder goes to owner
        fn distribute_rewards(
            ref self: ContractState, 
            question_id: u256, 
            agents: Array<ContractAddress>, 
            agent_reward: u256
        ) {
            let (creator, amount, is_resolved) = self.bounties.read(question_id);
            let caller = get_caller_address();
            
            assert(caller == creator, 'Only creator can distribute');
            assert(!is_resolved, 'Bounty already resolved');

            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let num_agents: u256 = agents.len().into();
            let total_agent_payout = agent_reward * num_agents;
            
            // Pay each agent
            let mut i: u32 = 0;
            loop {
                if i >= agents.len() {
                    break;
                }
                token.transfer(*agents.at(i), agent_reward);
                i += 1;
            };

            // Remainder to owner
            let owner = self.owner_address.read();
            if amount > total_agent_payout {
                token.transfer(owner, amount - total_agent_payout);
            }

            // Mark resolved
            self.bounties.write(question_id, (creator, amount, true));
        }

        fn get_question(self: @ContractState, question_id: u256) -> (ContractAddress, u256, bool) {
            self.bounties.read(question_id)
        }
    }
}

