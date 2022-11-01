const Voting = artifacts.require("Voting.sol");
const {BN, expectRevert, expectEvent} = require("@openzeppelin/test-helpers");
const {expect} = require("chai");

contract("Test cases for Voting contract", (accounts) => {
  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];
  const voter4 = accounts[4];
  const prop1 = "Proposition 1";
  const prop2 = "Proposition 2";
  const prop3 = "Proposition 3";

  let votingInstance;

  function buildVoting() {
    return Voting.new({from: admin});
  }

  describe("Test of the deployment phase", () => {
    beforeEach(async () => {
      votingInstance = await buildVoting();
    });

    it("should have an address", async () => {
      expect(votingInstance.address).to.be.not.null;
    });

    it("should have a voting admin (owner)", async () => {
      let owner = await votingInstance.owner();
      expect(owner).to.be.equal(admin);
    });
  });

  describe("Test of voters management : addVoter", () => {
    before(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
    });

    it("should have voter registered", async () => {
      let voter = await votingInstance.getVoter(voter1, {
        from: voter1,
      });
      expect(voter.isRegistered).to.be.true;
    });

    it("should have voter that has not voted", async () => {
      let voter = await votingInstance.getVoter(voter1, {
        from: voter1,
      });
      expect(voter.hasVoted).to.be.false;
    });

    it("should have voter that has votedProposalId set to 0", async () => {
      let voter = await votingInstance.getVoter(voter1, {
        from: voter1,
      });
      expect(voter.votedProposalId).to.be.bignumber.equal(BN(0));
    });

    it("should have multiple voters registered", async () => {
      await votingInstance.addVoter(voter2, {from: admin});
      await votingInstance.addVoter(voter3, {from: admin});
      let _voter2 = await votingInstance.getVoter(voter2, {
        from: voter1,
      });
      let _voter3 = await votingInstance.getVoter(voter3, {
        from: voter1,
      });
      expect(_voter2.isRegistered).to.be.true;
      expect(_voter3.isRegistered).to.be.true;
    });

    it("Should'nt add already registered voter, revert", async () => {
      await expectRevert(
        votingInstance.addVoter(voter1, {from: admin}),
        "Already registered"
      );
    });

    it("Should'nt allow a voter to add voter, revert", async () => {
      await expectRevert(
        votingInstance.addVoter(voter2, {from: voter1}),
        "Ownable: caller is not the owner"
      );
    });

    it("Should emit VoterRegistered event", async () => {
      let eventEmitted = await votingInstance.addVoter(voter4, {from: admin});
      await expectEvent(eventEmitted, "VoterRegistered", {
        voterAddress: voter4,
      });
    });
  });

  describe("Test of voters management : getVoter", () => {
    before(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
    });

    it("should return a registered voter with no vote", async () => {
      let registered = await votingInstance.getVoter(voter1, {from: voter1});
      expect(registered.isRegistered).to.be.true;
      expect(registered.hasVoted).to.be.false;
      expect(registered.votedProposalId).to.be.bignumber.equal(BN(0));
    });

    it("should'nt return an unregistered voter", async () => {
      let unregistered = await votingInstance.getVoter(voter2, {from: voter1});
      expect(unregistered.isRegistered).to.be.false;
    });

    it("should'nt be called by admin", async () => {
      await expectRevert(
        votingInstance.getVoter(voter1, {from: admin}),
        "You're not a voter"
      );
    });
  });

  describe("Test of proposal management : addProposal", () => {
    beforeEach(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
      await votingInstance.addVoter(voter2, {from: admin});
      await votingInstance.startProposalsRegistering({from: admin});
    });

    it("Should add a proposal description with 0 voteCount", async () => {
      await votingInstance.addProposal(prop1, {from: voter1});
      let prop = await votingInstance.getOneProposal(1, {from: voter1});
      expect(prop.description).to.be.equal(prop1);
      expect(prop.voteCount).to.be.bignumber.equal(BN(0));
    });

    it("Should add a proposal as admin, revert", async () => {
      await expectRevert(
        votingInstance.addProposal("Proposition admin", {from: admin}),
        "You're not a voter"
      );
    });

    it("Should add a proposal as unregistered voter, revert", async () => {
      await expectRevert(
        votingInstance.addProposal(prop3, {from: voter3}),
        "You're not a voter"
      );
    });

    it("Should'nt accept an empty proposal, revert", async () => {
      await expectRevert(
        votingInstance.addProposal("", {from: voter1}),
        "Vous ne pouvez pas ne rien proposer"
      );
    });

    it("Should emit ProposalRegistered event", async () => {
      const eventEmitted = await votingInstance.addProposal(prop1, {
        from: voter1,
      });
      await expectEvent(eventEmitted, "ProposalRegistered", {
        proposalId: BN(1),
      });
    });
  });

  describe("Test of proposal management : getOneProposal", () => {
    before(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
      await votingInstance.startProposalsRegistering({from: admin});
      await votingInstance.addProposal(prop1, {from: voter1});
    });

    it("Should return proposal of voter1 with id 1 and voteCount 0", async () => {
      let prop = await votingInstance.getOneProposal(1, {from: voter1});
      expect(prop.description).to.equal(prop1);
      expect(prop.voteCount).to.be.bignumber.equal(BN(0));
    });

    it("Should return GENESIS proposal", async () => {
      let prop = await votingInstance.getOneProposal(0, {from: voter1});
      expect(prop.description).to.equal("GENESIS");
      expect(prop.voteCount).to.be.bignumber.equal(BN(0));
    });

    it("Should'nt return proposal if admin calling, revert", async () => {
      await expectRevert(
        votingInstance.getOneProposal(1, {from: admin}),
        "You're not a voter"
      );
    });
  });

  describe("Test of voting : setVote", () => {
    beforeEach(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
      await votingInstance.addVoter(voter2, {from: admin});
      await votingInstance.startProposalsRegistering({from: admin});
      await votingInstance.addProposal(prop1, {
        from: voter1,
      });
      await votingInstance.addProposal(prop2, {
        from: voter2,
      });
      await votingInstance.endProposalsRegistering({from: admin});
      await votingInstance.startVotingSession({from: admin});
    });

    it("Should allow voter to vote", async () => {
      await votingInstance.setVote(1, {from: voter1});
      let voted = await votingInstance.getVoter(voter1, {from: voter1});
      expect(voted.hasVoted).to.be.true;
    });

    it("Should allow voter to vote for a proposal", async () => {
      await votingInstance.setVote(1, {from: voter1});
      let votedProp = await votingInstance.getOneProposal(1, {from: voter1});
      expect(votedProp.voteCount).to.be.bignumber.equal(BN(1));
    });

    it("Should'nt allow voter to vote twice", async () => {
      await votingInstance.setVote(1, {from: voter1});
      await expectRevert(
        votingInstance.setVote(1, {from: voter1}),
        "You have already voted"
      );
    });

    it("Should'nt allow voter to vote for unkown proposalId", async () => {
      await expectRevert(
        votingInstance.setVote(424242, {from: voter1}),
        "Proposal not found"
      );
    });

    it("Should'nt allow voter to vote for negative proposalId", async () => {
      await expectRevert(
        votingInstance.setVote(-1, {from: voter1}),
        'value out-of-bounds (argument="_id", value=-1, code=INVALID_ARGUMENT, version=abi/5.6.4)'
      );
    });

    it("Should allow voters to vote for the same proposal", async () => {
      await votingInstance.setVote(1, {from: voter1});
      await votingInstance.setVote(1, {from: voter2});
      let votedProp = await votingInstance.getOneProposal(1, {from: voter1});
      expect(votedProp.voteCount).to.be.bignumber.equal(BN(2));
    });

    it("Should allow voters to vote for different proposals", async () => {
      await votingInstance.setVote(1, {from: voter1});
      await votingInstance.setVote(2, {from: voter2});
      let votedProp = await votingInstance.getOneProposal(1, {from: voter1});
      expect(votedProp.voteCount).to.be.bignumber.equal(BN(1));
      votedProp = await votingInstance.getOneProposal(2, {from: voter1});
      expect(votedProp.voteCount).to.be.bignumber.equal(BN(1));
    });

    it("Should emit Voted event", async () => {
      const eventEmitted = await votingInstance.setVote(1, {from: voter1});
      await expectEvent(eventEmitted, "Voted", {
        voter: voter1,
        proposalId: BN(1),
      });
    });
  });

  describe("Test of final phase : tallyVotes", () => {
    before(async () => {
      votingInstance = await buildVoting();
      await votingInstance.addVoter(voter1, {from: admin});
      await votingInstance.addVoter(voter2, {from: admin});
      await votingInstance.addVoter(voter3, {from: admin});
      await votingInstance.startProposalsRegistering({from: admin});
      await votingInstance.addProposal(prop1, {
        from: voter1,
      });
      await votingInstance.addProposal(prop2, {
        from: voter2,
      });
      await votingInstance.endProposalsRegistering({from: admin});
      await votingInstance.startVotingSession({from: admin});
      await votingInstance.setVote(2, {from: voter1});
      await votingInstance.setVote(1, {from: voter2});
      await votingInstance.setVote(1, {from: voter3});
    });

    it("should tally votes and proposition 1 should win", async function () {
      await votingInstance.endVotingSession({from: admin});
      await votingInstance.tallyVotes({from: admin});
      expect(
        await votingInstance.winningProposalID.call()
      ).to.be.bignumber.equal(BN(1));
    });

    it("should'nt allow voter to tally votes", async function () {
      await expectRevert(
        votingInstance.tallyVotes({from: voter1}),
        "Ownable: caller is not the owner"
      );
    });

    it("should be called when VotingSessionEnded", async function () {
      await expectRevert(
        votingInstance.tallyVotes({from: admin}),
        "Current status is not voting session ended"
      );
    });
  });

  describe("Test of the workflow", () => {
    before(async () => {
      votingInstance = await buildVoting();
    });

    it("Should be in RegisteringVoters status", async () => {
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(0));
    });

    it("Should be in ProposalsRegistrationStarted status after RegisteringVoters and emit WorkflowStatusChange", async () => {
      const eventEmitted = await votingInstance.startProposalsRegistering();
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(1));
      await expectEvent(eventEmitted, "WorkflowStatusChange", {
        previousStatus: BN(0),
        newStatus: BN(1),
      });
    });

    it("Should be in ProposalsRegistrationEnded status after ProposalsRegistrationStarted and emit WorkflowStatusChange", async () => {
      const eventEmitted = await votingInstance.endProposalsRegistering();
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(2));
      await expectEvent(eventEmitted, "WorkflowStatusChange", {
        previousStatus: BN(1),
        newStatus: BN(2),
      });
    });

    it("Should be in VotingSessionStarted status after ProposalsRegistrationEnded and emit WorkflowStatusChange", async () => {
      const eventEmitted = await votingInstance.startVotingSession();
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(3));
      await expectEvent(eventEmitted, "WorkflowStatusChange", {
        previousStatus: BN(2),
        newStatus: BN(3),
      });
    });

    it("Should be in VotingSessionEnded status after VotingSessionStarted and emit WorkflowStatusChange", async () => {
      const eventEmitted = await votingInstance.endVotingSession();
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(4));
      await expectEvent(eventEmitted, "WorkflowStatusChange", {
        previousStatus: BN(3),
        newStatus: BN(4),
      });
    });

    it("Should be in VotesTallied status after VotingSessionEnded and emit WorkflowStatusChange", async () => {
      const eventEmitted = await votingInstance.tallyVotes();
      let status = await votingInstance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(BN(5));
      await expectEvent(eventEmitted, "WorkflowStatusChange", {
        previousStatus: BN(4),
        newStatus: BN(5),
      });
    });
  });
});
