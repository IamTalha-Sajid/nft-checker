import React, { useState } from "react";
import "./button.css";
import { ethers } from "ethers";
import ClaimButton from "./ClaimButton";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3modal from "web3modal";
import FlipPage from "../flippage";
import contractABI from "./../flippage/abi.json";

const WalletButtons = () => {
    // const [address, setaddress] = useState(0);
    const [account, setAccount] = useState(0);
    const [contract, setContract] = useState("");
    const [balance, setBalance] = useState("");
    const [tokenUrls, setOwnedTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State for loading

    // const contractABI = [
    //     "function symbol() view returns (string)",
    //     "function ownerOf(uint256 tokenId) view returns (address)",
    //     "function tokenURI(uint256 tokenId) public view returns (string memory)",
    // ];
    const bscNetwork = {
        chainId: "0x38", // 56 in decimal
        chainName: "Binance Smart Chain",
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
        },
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com"],
    };

    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    56: "https://bsc-dataseed1.binance.org",
                },
                chainId: 56,
            },
        },
    };

    const replaceIPFSPrefix = (url) => {
        const ipfsPrefix = "ipfs://";
        const httpsPrefix = "https://ipfs.io/ipfs/";

        // Replace IPFS prefix if needed
        if (url.startsWith(ipfsPrefix)) {
            url = httpsPrefix + url.substring(ipfsPrefix.length);
        } else {
            return null; // If the URL doesn't start with ipfsPrefix, return null
        }

        // Remove the token ID and file extension (the number and extension at the end of the URL)
        const pattern = /\/[^\/]+\.\w+$/;
        url = url.replace(pattern, "");
        console.log({ url });

        return url;
    };

    // Function to connect wallet
    const connectWallet = async () => {
        console.log("Connecting");
        // const provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
            // Request accounts and set up session
            const web3modal = new Web3modal({
                cacheProvider: true,
                providerOptions,
            });
            const instance = await web3modal.connect();
            const web3modalProvider = new ethers.providers.Web3Provider(
                instance
            );
            const address = (await web3modalProvider.listAccounts())[0];
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS; // Replace with your contract address
            const contract = new ethers.Contract(
                "0x68Cf77b11B839b93Ae5C85DE27aa6C2e62b1Dd9A",
                contractABI,
                web3modalProvider
            );

            setContract(contract);

            // Check if we are on the BSC network
            const { chainId } = await web3modalProvider.getNetwork();
            if (chainId !== 56) {
                try {
                    // Try to switch to the BSC network
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: bscNetwork.chainId }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [bscNetwork],
                            });
                        } catch (addError) {
                            console.error(
                                "Error adding BSC network:",
                                addError
                            );
                        }
                    } else {
                        console.error(
                            "Error switching to BSC network:",
                            switchError
                        );
                    }
                }
            }

            // Fetch balance after confirming network
            // const balance = await web3modalProvider.getBalance(address);
            // const balanceInEth = ethers.utils.formatEther(balance);
            setAccount(address);
            // setBalance(balanceInEth);
            // checkTokenOwnership("useEffect");
            console.log(
                "Connected account:",
                address,
                "Balance:"
                // balanceInEth
            );
        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    };
    //     setIsLoading(true); // Set loading to true when the function starts

    //     if (from !== "useEffect") {
    //         if (!account) {
    //             alert("Please connect your wallet first.");
    //             setIsLoading(false); // Set loading to false if no account is connected
    //             return;
    //         }
    //     }

    //     let ownedTokens = [];

    //     const provider = new ethers.providers.Web3Provider(window.ethereum);
    //     const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS; // Replace with your contract address
    //     const contract = new ethers.Contract(
    //         contractAddress,
    //         contractABI,
    //         provider
    //     );

    //     let urls = [];

    //     for (let tokenId = 1; tokenId <= 5; tokenId++) {
    //         try {
    //             const tokenOwner = await contract.ownerOf(tokenId);
    //             if (tokenOwner.toLowerCase() === account.toLowerCase()) {
    //                 ownedTokens.push(tokenId);
    //                 const uri = await getTokenUri(tokenId);
    //                 console.log({ uri });
    //                 urls.push({ tokenUri: uri, tokenId });
    //             }
    //         } catch (error) {
    //             // console.log(
    //             //     `Token ID ${tokenId} is not found or error fetching:`,
    //             //     error
    //             // );
    //         }
    //     }
    //     setOwnedTokens(urls);

    //     console.log(`Tokens owned by the connected wallet:`, ownedTokens);
    //     if (from !== "useEffect") {
    //         alert(`You own ${ownedTokens.length} tokens from ID 1 to 100.`);
    //     }

    //     if (ownedTokens.length === 100) {
    //         if (from !== "useEffect") {
    //             alert("Congratulations! You own all 100 tokens.");
    //             sendEmail();
    //         }
    //     }

    //     setIsLoading(false); // Set loading to false when the function ends
    // };

    const sendEmail = async () => {
        const emailInfo = {
            to: process.env.REACT_APP_TO_EMAIL, // This should be set to the recipient's email address
            subject: process.env.REACT_APP_EMAIL_SUBJECT,
            text: `Congratulations! The address ${account} now own all 100 NFTs.`,
        };

        try {
            const response = await fetch(process.env.REACT_APP_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailInfo),
            });

            const data = await response.json();
            if (response.status === 200) {
                console.log("Email sent successfully:", data);
                alert("Email sent successfully!");
            } else {
                console.error("Failed to send email:", data);
                alert("Failed to send email.");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error sending email.");
        }
    };

    return (
        <div>
            <FlipPage wallet={account} contract={contract} />
            <div className="button_container" style={{marginBottom:"10rem"}} >
                <a href="https://mintmemesv1.cr8rtoken.io/">
                    <button className="neon_button">Mint Cards</button>
                </a>
                <button className="neon_button" onClick={connectWallet}>
                    {" "}
                    {account === 0
                        ? "Connect Wallet"
                        : `${account?.slice(0, 8)}....`}{" "}
                </button>
                <button className="neon_button">Claim Button</button>
                {/* <ClaimButton /> */}
            </div>
        </div>
    );
};

export default WalletButtons;
