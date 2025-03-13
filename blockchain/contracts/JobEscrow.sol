// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JobEscrow {
    address payable public employer;
    address payable public freelancer;
    uint public amount;
    bool public freelancerApproved;
    bool public employerApproved;
    string public jobId;
    
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }
    State public state;

    event FundsDeposited(address from, uint amount);
    event DeliveryConfirmed(address by, uint amount);
    event FundsRefunded(address to, uint amount);

    modifier onlyEmployer() {
        require(msg.sender == employer, "Only employer can call this function");
        _;
    }

    modifier inState(State _state) {
        require(state == _state, "Invalid state for this action");
        _;
    }

    constructor(address payable _freelancer, string memory _jobId) payable {
        employer = payable(msg.sender);
        freelancer = _freelancer;
        jobId = _jobId;
        amount = msg.value;
        
        if (msg.value > 0) {
            state = State.AWAITING_DELIVERY;
            emit FundsDeposited(msg.sender, msg.value);
        } else {
            state = State.AWAITING_PAYMENT;
        }
    }

    // Employer deposits funds to start the contract
    function depositFunds() external payable onlyEmployer inState(State.AWAITING_PAYMENT) {
        amount += msg.value;
        state = State.AWAITING_DELIVERY;
        emit FundsDeposited(msg.sender, msg.value);
    }

    // Employer confirms work delivery and releases payment
    function confirmDelivery() external onlyEmployer inState(State.AWAITING_DELIVERY) {
        state = State.COMPLETE;
        freelancer.transfer(amount);
        emit DeliveryConfirmed(msg.sender, amount);
    }

    // Employer can refund the money if freelancer hasn't delivered
    function refund() external onlyEmployer inState(State.AWAITING_DELIVERY) {
        state = State.REFUNDED;
        employer.transfer(amount);
        emit FundsRefunded(employer, amount);
    }

    // View the contract balance
    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }
} 