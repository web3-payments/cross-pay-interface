import * as ERC20 from "../abis/ERC20/ERC20.json";
import { Contract, ethers } from "ethers";


export const toWei = (num, decimals) => ethers.utils.parseUnits(num.toString(), decimals.toString());
export const fromWei = (num, decimals) => ethers.utils.formatUnits(num.toString(), decimals.toString());


export async function payUsingEth(paymentContract, paymentInfo) {
    const transaction = await paymentContract.pay(paymentInfo.creditAddress, { value: ethers.utils.parseEther(paymentInfo.amount.toString()) }); // use the amount from the paymentInfo
    console.log(`Payment Transaction Hash: ${transaction.hash}`);
    const result = await transaction.wait();
    console.log(result);
    console.log("Payment Executed");
    const transactionDetails = {
        transactionHash: transaction.hash, 
        blockHash: result.blockHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed.toString(),
        toAddress: result.to,
        fromAddress: result.from,
        confirmations: result.confirmations
    };
    return transactionDetails;
}

export async function paymentERC20(paymentContract, paymentInfo, signer) {
    // TODO: Create a util class to handle smart contract operations // paymentExecution
    const ERC20Contract = new Contract(
        paymentInfo.cryptocurrency.address,
        ERC20.abi,
        signer
    );
    const approvalTransaction = await ERC20Contract.approve(paymentInfo.cryptocurrency.smartContract.address,
        toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
    console.log(`Approval Transaction Hash: ${approvalTransaction.hash}`);
    const approvalResult = await approvalTransaction.wait();
    console.log(approvalResult);
    const transaction = await paymentContract.payUsingToken(paymentInfo.creditAddress, paymentInfo.cryptocurrency.address, toWei(paymentInfo.amount, paymentInfo.cryptocurrency.decimals));
    console.log(`Payment Transaction Hash: ${transaction.hash}`);
    const result = await transaction.wait();
    console.log(result);
    console.log("ERC20 Payment Executed");
    const transactionDetails = {
        transactionHash: transaction.hash,
        blockHash: result.blockHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed.toString(),
        toAddress: result.to,
        fromAddress: result.from,
        confirmations: result.confirmations
    };
    return transactionDetails;
}