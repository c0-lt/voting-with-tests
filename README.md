## Projet Sytème de vote 2 - Testing

Les jeux de test du contrat Voting sont organisés de la manière suivante : 
- Test du déploiement
- Test de la gestion des voters
    - Fonction addVoter
    - Fonction getVoter
- Test de la gestion des propositions
    - Fonction addProposal
    - Fonction getOneProposal
- Test du vote : setVote
- Test de la phase de dépouillement : tallyVotes
- Test global de l'enchainement du workflow

## Trace du lancement des tests 

    Contract: Test cases for Voting contract
      Test of the deployment phase
        ✓ should have an address (1ms)
        ✓ should have a voting admin (owner) (11ms)
      Test of voters management : addVoter
        ✓ should have voter registered (11ms)
        ✓ should have voter that has not voted (14ms)
        ✓ should have voter that has votedProposalId set to 0 (10ms)
        ✓ should have multiple voters registered (91ms, 100428 gas)
        ✓ Should'nt add already registered voter, revert (445ms)
        ✓ Should'nt allow a voter to add voter, revert (11ms)
        ✓ Should emit VoterRegistered event (32ms, 50220 gas)
      Test of voters management : getVoter
        ✓ should return a registered voter with no vote (9ms)
        ✓ should'nt return an unregistered voter (8ms)
        ✓ should'nt be called by admin (27ms)
      Test of proposal management : addProposal
        ✓ Should add a proposal description with 0 voteCount (46ms, 59316 gas)
        ✓ Should'nt add a proposal as admin, revert (12ms)
        ✓ Should'nt add a proposal as unregistered voter, revert (11ms)
        ✓ Should'nt accept an empty proposal, revert (12ms)
        ✓ Should emit ProposalRegistered event (42ms, 59316 gas)
      Test of proposal management : getOneProposal
        ✓ Should return proposal of voter1 with id 1 and voteCount 0 (12ms)
        ✓ Should return GENESIS proposal (13ms)
        ✓ Should'nt return proposal if admin calling, revert (9ms)
      Test of voting : setVote
        ✓ Should allow voter to vote (70ms, 78013 gas)
        ✓ Should allow voter to vote for a proposal (51ms, 78013 gas)
        ✓ Should'nt allow voter to vote twice (63ms, 78013 gas)
        ✓ Should'nt allow voter to vote for unkown proposalId (17ms)
        ✓ Should'nt allow voter to vote for negative proposalId (7ms)
        ✓ Should allow voters to vote for the same proposal (68ms, 138926 gas)
        ✓ Should allow voters to vote for different proposals (74ms, 156026 gas)
        ✓ Should emit Voted event (27ms, 78013 gas)
      Test of final phase : tallyVotes
        ✓ should tally votes and proposition 1 should win (49ms, 94098 gas)
        ✓ should'nt allow voter to tally votes (19ms)
        ✓ should be called when VotingSessionEnded (10ms)
      Test of the workflow
        ✓ Should be in RegisteringVoters status (6ms)
        ✓ Should be in ProposalsRegistrationStarted status after RegisteringVoters and emit WorkflowStatusChange (81ms, 95032 gas)
        ✓ Should be in ProposalsRegistrationEnded status after ProposalsRegistrationStarted and emit WorkflowStatusChange (26ms, 30599 gas)
        ✓ Should be in VotingSessionStarted status after ProposalsRegistrationEnded and emit WorkflowStatusChange (28ms, 30554 gas)
        ✓ Should be in VotingSessionEnded status after VotingSessionStarted and emit WorkflowStatusChange (82ms, 30533 gas)
        ✓ Should be in VotesTallied status after VotingSessionEnded and emit WorkflowStatusChange (30ms, 37849 gas)
    37 passing (14s)
## eth-gas-reporter Report

    ·------------------------------------------|----------------------------|-------------|----------------------------·
    |   Solc version: 0.8.17+commit.8df45f5f   ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
    ···········································|····························|·············|·····························
    |  Methods                                                                                                         │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  addProposal                ·           -  ·          -  ·      59316  ·          23  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  addVoter                   ·       50208  ·      50220  ·      50219  ·          40  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30599  ·          10  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  endVotingSession           ·           -  ·          -  ·      30533  ·           3  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  setVote                    ·       60913  ·      78013  ·      74349  ·          14  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      95032  ·          18  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  startVotingSession         ·           -  ·          -  ·      30554  ·          12  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Voting    ·  tallyVotes                 ·       37849  ·      63565  ·      57136  ·           4  ·          -  │
    ·············|·····························|··············|·············|·············|··············|··············
    |  Deployments                             ·                                          ·  % of limit  ·             │
    ···········································|··············|·············|·············|··············|··············
    |  Voting                                  ·           -  ·          -  ·    2077414  ·      30.9 %  ·          -  │
    ·------------------------------------------|--------------|-------------|-------------|--------------|-------------·

