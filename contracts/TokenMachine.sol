// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.7;

error ZeroEtherSent();
error TransferFailed();
error NotEnoughTokens();
error NotEnoughTokensAllowed();
error NotEnoughEth();

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenMachine {
    /** VARIABLES */
    IERC20 private stakingToken;
    uint256 private constant BUY_RATE = 1000;

    /** EVENTS */
    event TokensBought(address indexed buyer, uint256 indexed value);
    event TokensSold(address indexed buyer, uint256 indexed value);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    /*
     * @notice Method for buying ERC20 tokens with fixed buy rate "1000"
     */

    function buyTokens() external payable {
        uint256 tokensToTransfer = BUY_RATE * msg.value;
        if (tokensToTransfer == 0) {
            revert ZeroEtherSent();
        }
        bool success = stakingToken.transfer(msg.sender, tokensToTransfer);
        if (!success) {
            revert TransferFailed();
        }
        emit TokensBought(msg.sender, tokensToTransfer);
    }

    /*
     * @notice Method for selling ERC20 tokens with fixed sell rate "1000"
     */

    function sellTokens(uint256 _tokenAmount) external {
        if (stakingToken.balanceOf(msg.sender) < _tokenAmount) {
            revert NotEnoughTokens();
        }

        if (stakingToken.allowance(msg.sender, address(this)) < _tokenAmount) {
            revert NotEnoughTokensAllowed();
        }

        uint256 ethToTransfer = _tokenAmount / BUY_RATE;

        if ((address(this)).balance < ethToTransfer) {
            revert NotEnoughEth();
        }

        bool success_1 = stakingToken.transferFrom(msg.sender, address(this), _tokenAmount);
        if (!success_1) {
            revert TransferFailed();
        }

        (bool success_2, ) = payable(msg.sender).call{value: ethToTransfer}("");
        if (!success_2) {
            revert TransferFailed();
        }
        emit TokensSold(msg.sender, _tokenAmount);
    }

    /** GETTER FUNCTIONS */

    function getStakingToken() public view returns (address) {
        return address(stakingToken);
    }

    function getBuyRate() public pure returns (uint256) {
        return BUY_RATE;
    }
}
