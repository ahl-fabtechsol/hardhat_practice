import React, { useState, useEffect } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "./utils/contract";
import { uploadToIPFS } from "./utils/web3Storage";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  owner: string;
}

function App() {
  const [account, setAccount] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (account) {
      loadProducts();
    }
  }, [account]);

  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) {
        console.log("Please install MetaMask");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this application");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === -32002) {
        alert(
          "Please check MetaMask. A connection request is already pending."
        );
      } else {
        alert("Error connecting wallet. Please try again.");
      }
    }
  };

  const loadProducts = async () => {
    if (!account) return;
    try {
      const contract = getContract();
      const allProducts = await contract.getAllProducts();
      console.log("All products:", allProducts);
      const formattedProducts = allProducts.map((product: any) => ({
        id: product.id.toNumber(),
        name: product.name,
        description: product.description,
        price: ethers.utils.formatEther(product.price),
        owner: product.owner,
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    setLoading(true);

    try {
      let imageUrl = "";
      if (formData.image) {
        imageUrl = await uploadToIPFS(formData.image);
      }

      const contract = getContract();
      const price = ethers.utils.parseEther(formData.price);

      const tx = await contract.createProduct(
        formData.name,
        formData.description,
        price
      );

      // Wait for transaction confirmation
      await tx.wait();

      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
      });

      await loadProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      if (error.code === 4001) {
        alert("Transaction was rejected by user");
      } else {
        alert("Error creating product. Please check the console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Product Marketplace</h2>
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {account
                ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </button>
          </div>

          {!account && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Please connect your wallet to interact with the marketplace
              </p>
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {account && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="mt-1 block w-full"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600 mt-1">{product.description}</p>
                <p className="text-indigo-600 font-semibold mt-2">
                  {product.price} ETH
                </p>
                <p className="text-sm text-gray-500 mt-2 truncate">
                  Owner: {product.owner === account ? "You" : product.owner}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
