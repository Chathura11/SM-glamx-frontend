import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Grid, Button, MenuItem, Select, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import axiosInstance from '../../api/api';

const SalesPage = ({ authUser }) => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [orderedItems, setOrderedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userId] = useState(authUser);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, inventoryRes] = await Promise.all([
      axiosInstance.get('/products'),
      axiosInstance.get('/inventories')
    ]);

    setProducts(productsRes.data.data);

    const inventoryMap = {};
    inventoryRes.data.data.forEach(item => {
      inventoryMap[item.product._id] = item.sizes;
    });
    setInventory(inventoryMap);
  };

  const getCostPriceFIFO = async (productId, size, qty) => {
    try {
      const res = await axiosInstance.get(`/stocks/fifo-cost`, {
        params: { productId, size, quantity: qty }
      });
      return res.data.costPrice;
    } catch (error) {
      console.error('Error fetching cost price:', error);
      return 0;
    }
  };

  const addItem = async () => {
    if (!selectedProduct || !selectedSize || quantity < 1) {
      alert("Please select product, size, and quantity.");
      return;
    }

    const invSizes = inventory[selectedProduct._id] || [];
    const sizeEntry = invSizes.find(s => s.size === selectedSize);
    if (!sizeEntry || sizeEntry.quantity < quantity) {
      return alert("Not enough stock for selected size.");
    }

    const existingIndex = orderedItems.findIndex(
      item => item.product._id === selectedProduct._id && item.size === selectedSize
    );

    const costPrice = await getCostPriceFIFO(selectedProduct._id, selectedSize, quantity);
    const sellingPrice = selectedProduct.price;

    const newItem = {
      product: selectedProduct,
      size: selectedSize,
      quantity,
      sellingPrice,
      costPrice,
      profit: (sellingPrice - costPrice) * quantity,
    };

    const newOrdered = [...orderedItems];
    if (existingIndex >= 0) {
      newOrdered[existingIndex].quantity += quantity;
      newOrdered[existingIndex].profit += newItem.profit;
    } else {
      newOrdered.push(newItem);
    }

    setOrderedItems(newOrdered);
    setQuantity(1);
    setSelectedSize('');
  };

  const handleSell = async () => {
    if (orderedItems.length === 0) return alert("No items to sell.");

    const items = orderedItems.map(item => ({
      product: item.product._id,
      size: item.size,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      costPrice: item.costPrice
    }));

    try {
      await axiosInstance.post('/sales', {
        userId,
        customerName,
        paymentMethod,
        items,
        discount
      });

      alert("Sale completed!");
      fetchData();
      handleClear();
    } catch (err) {
      console.error(err);
      alert("Failed to complete sale.");
    }
  };

  const handleClear = () => {
    setOrderedItems([]);
    setCustomerName('');
    setDiscount(0);
    setQuantity(1);
    setSelectedProduct(null);
    setSelectedSize('');
  };

  const subtotal = orderedItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const totalPayable = subtotal - discount;

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            label="Discount (Rs.)"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
            inputProps={{ min: 0 }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Select
            sx={{ width: '100%' }}
            value={selectedProduct?._id || ''}
            onChange={(e) => {
              const prod = products.find(p => p._id === e.target.value);
              setSelectedProduct(prod);
              setSelectedSize('');
            }}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Product</MenuItem>
            {products.map(p => (
              <MenuItem key={p._id} value={p._id}>
                {p.name + " | " + p.category.name + " | " + p.brand.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Select
            fullWidth
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            displayEmpty
            disabled={!selectedProduct}
          >
            <MenuItem value="" disabled>Select Size</MenuItem>
            {(inventory[selectedProduct?._id] || []).map(sizeObj => (
              <MenuItem key={sizeObj.size} value={sizeObj.size}>
                {sizeObj.size} ({sizeObj.quantity})
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            label="Quantity"
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={3}>
          <Select
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Payment Method</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Mobile Payment">Mobile Payment</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth onClick={addItem} variant="contained" color="primary">
            Add Item
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Cost Price</TableCell>
              <TableCell>Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderedItems.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.sellingPrice}</TableCell>
                <TableCell>{item.costPrice}</TableCell>
                <TableCell>{item.profit.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={4}>
          <Typography variant="h6">Subtotal: Rs. {subtotal.toFixed(2)}</Typography>
          <Typography variant="h6">Discount: Rs. {discount.toFixed(2)}</Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>Total Payable: Rs. {totalPayable.toFixed(2)}</Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button fullWidth variant="contained" color="success" onClick={handleSell}>
                Complete Sale
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth variant="outlined" color="secondary" onClick={handleClear}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SalesPage;
