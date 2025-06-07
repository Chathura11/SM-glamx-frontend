import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/api';

const SIZES = ['S', 'M', 'L', 'XL'];

const StockEntryForm = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [data, setData] = useState({
    supplier: '',
    invoiceNumber: '',
    location: '',
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    product: '',
    size: '',
    quantity: '',
    costPrice: ''
  });

  const [response, setResponse] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [prodRes, supRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/suppliers')
      ]);
      setProducts(prodRes.data.data.filter(p => p.status));
      setSuppliers(supRes.data.data.filter(s => s.status));
    }
    fetchData();
  }, []);

  const handleEntryChange = ({ target: { name, value } }) => {
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = ({ target: { name, value } }) => {
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (currentItem.product && currentItem.size && currentItem.quantity && currentItem.costPrice) {
      setData(prev => ({
        ...prev,
        items: [...prev.items, { ...currentItem }]
      }));
      setCurrentItem({ product: '', size: '', quantity: '', costPrice: '' });
    }
  };

  const removeItem = (indexToRemove) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setResponse('');

    if (data.items.length === 0) {
      setServerError('Add at least one item.');
      return;
    }

    try {
      await axiosInstance.post('/stocks/stock-entries', data);
      setResponse('Stock entry recorded successfully!');
      setData({
        supplier: '',
        invoiceNumber: '',
        location: '',
        items: []
      });
    } catch (error) {
      setServerError(error.response?.data?.data || 'Server Error');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <FormControl fullWidth required>
            <InputLabel>Supplier</InputLabel>
            <Select name="supplier" value={data.supplier} onChange={handleEntryChange}>
              {suppliers.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Invoice Number"
            name="invoiceNumber"
            value={data.invoiceNumber}
            onChange={handleEntryChange}
            size="small"
          />

          <TextField
            label="Location"
            name="location"
            value={data.location}
            onChange={handleEntryChange}
            size="small"
          />

          <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Product</InputLabel>
                <Select name="product" value={currentItem.product} onChange={handleItemChange}>
                  {products.map(p => (
                    <MenuItem key={p._id} value={p._id}>{p.name + " " + p.category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Size</InputLabel>
                <Select name="size" value={currentItem.size} onChange={handleItemChange}>
                  {SIZES.map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={currentItem.quantity}
                onChange={handleItemChange}
                size="small"
              />

              <TextField
                label="Cost Price"
                name="costPrice"
                type="number"
                value={currentItem.costPrice}
                onChange={handleItemChange}
                size="small"
              />

              <Button variant="outlined" onClick={addItem}>Add Item</Button>
            </Stack>
          </Box>

          {data.items.length > 0 && (
            <Box>
              <strong>Items:</strong>
              <ul style={{ paddingLeft: '1rem' }}>
                {data.items.map((item, index) => {
                  const product = products.find(p => p._id === item.product);
                  return (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ flexGrow: 1 }}>
                        {product?.name || 'Unknown'} - {item.size} - {item.quantity} x {item.costPrice}
                      </span>
                      <IconButton color="error" onClick={() => removeItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </li>
                  );
                })}
              </ul>
            </Box>
          )}

          {serverError && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {serverError}
            </Alert>
          )}

          {response && (
            <Alert severity="success">
              <AlertTitle>{response}</AlertTitle>
            </Alert>
          )}

          <Box sx={{ textAlign: 'end' }}>
            <Button type="submit" variant="contained" onClick={handleSubmit}>
              Save Stock Entry
            </Button>
          </Box>
        </Stack>
    </Paper>
  );
};

export default StockEntryForm;
