// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductManager {
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address owner;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductCreated(
        uint256 id,
        string name,
        string description,
        uint256 price,
        address owner
    );

    event ProductUpdated(
        uint256 id,
        string name,
        string description,
        uint256 price,
        address owner
    );

    event ProductDeleted(uint256 id);

    // Create a new product
    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            _price,
            msg.sender
        );

        emit ProductCreated(
            productCount,
            _name,
            _description,
            _price,
            msg.sender
        );
    }

    // Read a single product by ID
    function getProduct(uint256 _id) public view returns (Product memory) {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        return products[_id];
    }

    // Read all products
    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        for (uint256 i = 0; i < productCount; i++) {
            allProducts[i] = products[i + 1]; // Products are stored starting from index 1
        }
        return allProducts;
    }

    // Update an existing product
    function updateProduct(
        uint256 _id,
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        require(products[_id].owner == msg.sender, "Only the owner can update the product");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        products[_id].name = _name;
        products[_id].description = _description;
        products[_id].price = _price;

        emit ProductUpdated(
            _id,
            _name,
            _description,
            _price,
            msg.sender
        );
    }

    // Delete a product
    function deleteProduct(uint256 _id) public {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        require(products[_id].owner == msg.sender, "Only the owner can delete the product");

        delete products[_id];
        emit ProductDeleted(_id);
    }
}