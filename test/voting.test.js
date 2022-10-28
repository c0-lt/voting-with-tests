const Voting = artifacts.require("Voting.sol");
const {BN, expectRevert, expectEvent} = require("@openzeppelin/test-helpers");
const {expect} = require("chai");

contract("Voting", (accounts) => {
	const admin = accounts[0];
	const voter1 = accounts[1];
	const voter2 = accounts[2];
	const voter3 = accounts[3];

	let votingInstance;

	// TEST TEMPLATE
	describe("", () => {
		before(async () => {
			votingInstance = await Voting.new({from: admin});
		});
		it("", async () => {});
	});

	describe.skip("Registration", () => {
		beforeEach(async () => {
			votingInstance = await Voting.new({from: admin});
		});

		it("should have a voting admin", async () => {
			let owner = await votingInstance.owner.call();
			expect(owner).to.be.equal(admin);
		});

		it("should have voter registered", async () => {
			await votingInstance.addVoter(accounts[1], {from: admin});
			let voter = await votingInstance.getVoter.call(voter1, {
				from: voter1,
			});
			expect(voter.isRegistered).to.be.true;
		});

		it("should have voter that has not voted", async () => {
			await votingInstance.addVoter(accounts[1], {from: admin});
			let voter = await votingInstance.getVoter.call(voter1, {
				from: voter1,
			});
			expect(voter.hasVoted).to.be.false;
		});

		it("should have voter that has votedProposalId set to 0", async () => {
			await votingInstance.addVoter(accounts[1], {from: admin});
			let voter = await votingInstance.getVoter.call(voter1, {
				from: voter1,
			});
			expect(voter.votedProposalId).to.be.bignumber.equal(BN(0));
		});
	});

	describe.skip("Proposal management", () => {
		beforeEach(async () => {
			votingInstance = await Voting.new({from: admin});
			await votingInstance.addVoter(voter1, {from: admin});
			await votingInstance.addVoter(voter2, {from: admin});
			await votingInstance.startProposalsRegistering({from: admin});
		});

		it("Add a proposal", async () => {
			await votingInstance.addProposal("Proposition 1", {from: voter1});
			let prop = await votingInstance.getOneProposal(1, {from: voter1});
			expect(prop.description).to.be.equal("Proposition 1");
		});

		it("Add a proposal as admin, revert", async () => {
			await expectRevert(
				votingInstance.addProposal("Proposition admin", {from: admin}),
				"You're not a voter"
			);
		});

		it("Should not accept an empty proposal", async () => {
			await expectRevert(
				votingInstance.addProposal("", {from: voter1}),
				"Vous ne pouvez pas ne rien proposer"
			);
		});

		it("Should emit ProposalRegistered", async () => {
			const eventEmitted = await votingInstance.addProposal("Proposition 1", {
				from: voter1,
			});
			//console.log("Array length : ", votingInstance.proposalsArray.length);
			await expectEvent(eventEmitted, "ProposalRegistered", {
				proposalId: BN(1),
			});
		});
	});

	describe("Voter management", () => {
		before(async () => {
			votingInstance = await Voting.new({from: admin});
		});

		it("Already registerd voter, revert", async () => {
			await votingInstance.addVoter(voter3, {from: admin});
			await expectRevert(
				votingInstance.addVoter(voter3, {from: admin}),
				"Already registered"
			);
		});
	});

	describe("Test setVote", () => {
		before(async () => {
			votingInstance = await Voting.new({from: admin});
			await votingInstance.addVoter(voter1, {from: admin});
			await votingInstance.addVoter(voter2, {from: admin});
			await votingInstance.startProposalsRegistering({from: admin});
			await votingInstance.addProposal("Proposition 1", {
				from: voter1,
			});
			await votingInstance.addProposal("Proposition 2", {
				from: voter2,
			});
			await votingInstance.endProposalsRegistering({from: admin});
			await votingInstance.startVotingSession({from: admin});
		});
		it("", async () => {});
	});
});
