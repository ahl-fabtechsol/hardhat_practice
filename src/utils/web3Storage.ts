import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ token: import.meta.env.VITE_WEB3_STORAGE_TOKEN });

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const cid = await client.put([file]);
    return `https://${cid}.ipfs.dweb.link/${file.name}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};