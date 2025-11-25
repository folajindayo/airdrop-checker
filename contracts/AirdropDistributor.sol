// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title AirdropDistributor
 * @dev Distributes tokens via merkle tree for gas efficiency
 */
contract AirdropDistributor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Campaign {
        IERC20 token;
        bytes32 merkleRoot;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    uint256 public campaignCount;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed token,
        bytes32 merkleRoot,
        uint256 totalAmount
    );
    event Claimed(
        uint256 indexed campaignId,
        address indexed user,
        uint256 amount
    );
    event CampaignEnded(uint256 indexed campaignId);

    /**
     * @dev Create new airdrop campaign
     */
    function createCampaign(
        address token,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 duration
    ) external onlyOwner returns (uint256) {
        require(token != address(0), "Invalid token");
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        require(totalAmount > 0, "Invalid amount");
        require(duration > 0, "Invalid duration");

        uint256 campaignId = campaignCount++;

        campaigns[campaignId] = Campaign({
            token: IERC20(token),
            merkleRoot: merkleRoot,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            active: true
        });

        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        emit CampaignCreated(campaignId, token, merkleRoot, totalAmount);
        return campaignId;
    }

    /**
     * @dev Claim airdrop
     */
    function claim(
        uint256 campaignId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.active, "Campaign not active");
        require(block.timestamp >= campaign.startTime, "Not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(!hasClaimed[campaignId][msg.sender], "Already claimed");
        require(amount > 0, "Invalid amount");

        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(merkleProof, campaign.merkleRoot, leaf),
            "Invalid proof"
        );

        hasClaimed[campaignId][msg.sender] = true;
        campaign.claimedAmount += amount;

        campaign.token.safeTransfer(msg.sender, amount);

        emit Claimed(campaignId, msg.sender, amount);
    }

    /**
     * @dev End campaign and withdraw unclaimed tokens
     */
    function endCampaign(uint256 campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.active, "Campaign not active");
        require(
            block.timestamp > campaign.endTime,
            "Campaign still active"
        );

        campaign.active = false;
        uint256 unclaimedAmount = campaign.totalAmount - campaign.claimedAmount;

        if (unclaimedAmount > 0) {
            campaign.token.safeTransfer(owner(), unclaimedAmount);
        }

        emit CampaignEnded(campaignId);
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(
        uint256 campaignId
    ) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "Campaign not active");

        campaign.active = false;
        uint256 remainingAmount = campaign.totalAmount - campaign.claimedAmount;

        if (remainingAmount > 0) {
            campaign.token.safeTransfer(owner(), remainingAmount);
        }
    }

    /**
     * @dev Check if user can claim
     */
    function canClaim(
        uint256 campaignId,
        address user,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        Campaign memory campaign = campaigns[campaignId];
        
        if (!campaign.active) return false;
        if (block.timestamp < campaign.startTime) return false;
        if (block.timestamp > campaign.endTime) return false;
        if (hasClaimed[campaignId][user]) return false;

        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        return MerkleProof.verify(merkleProof, campaign.merkleRoot, leaf);
    }
}
