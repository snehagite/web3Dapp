import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import "./Healthcare.css";

const Healthcare = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [patientID, setPatientID] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);
    const [providerAddress, setProviderAddress] = useState("");

    const contractAddress = "0x7368d207212f513654d7afd4985d37f670b497e1";

    const contractABI =
    [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizedProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        const connectWallet = async () => {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                setProvider(provider);
                setSigner(signer);

                const accountAddress = await signer.getAddress();
                setAccount(accountAddress);

                const contract = new Contract(contractAddress, contractABI, signer);
                setContract(contract);

                const ownerAddress = await contract.getOwner();
                setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
            } catch (error) {
                console.error("Error connecting to wallet: ", error);
            }
        };
        connectWallet();
    }, []);

    const fetchPatientRecords = async () => {
        try {
            const records = await contract.getPatientRecords(patientID);
            console.log(records);
            setPatientRecords(records);
        } catch (error) {
            console.error("Error fetching patient records", error);
        }
    };

    const addRecord = async () => {
        try {
            const tx = await contract.addRecord(patientID, patientName, diagnosis, treatment);
            await tx.wait();
            fetchPatientRecords();
        } catch (error) {
            console.error("Error adding record", error);
        }
    };

    const authorizeProvider = async () => {
        if (isOwner) {
            try {
                const tx = await contract.authorizedProvider(providerAddress);
                await tx.wait();
                alert(`Provider ${providerAddress} authorized successfully`);
            } catch (error) {
                console.error("Error authorizing provider", error);
            }
        } else {
            alert("Only contract owner can authorize providers");
        }
    };

    return (
        <div className='container'>
            <h1 className="title">HealthCare Application</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className='form-section'>
                <h2>Fetch Patient Records</h2>
                <input className='input-field' type='text' placeholder='Enter Patient ID' value={patientID} onChange={(e) => setPatientID(e.target.value)} />
                <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
            </div>

            <div className="form-section">
                <h2>Add Patient Record</h2>
                <input className='input-field' type='text' placeholder='Patient Name' value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                <input className='input-field' type='text' placeholder='Diagnosis' value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                <input className='input-field' type='text' placeholder='Treatment' value={treatment} onChange={(e) => setTreatment(e.target.value)} />
                <button className='action-button' onClick={addRecord}>Add Record</button>
            </div>

            <div className="form-section">
                <h2>Authorize HealthCare Provider</h2>
                <input className='input-field' type="text" placeholder='Provider Address' value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} />
                <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
            </div>

            <div className='records-section'>
                <h2>Patient Records</h2>
                {patientRecords.map((record, index) => (
                    <div key={index}>
                        <p><strong>Record ID:</strong> {record.recordID.toString()}</p>
                        <p><strong>Name:</strong> {record.patientName}</p>
                        <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                        <p><strong>Treatment:</strong> {record.treatment}</p>
                        <p><strong>Timestamp:</strong> {new Date(Number(record.timestamp) * 1000).toLocaleString()}</p>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Healthcare;
