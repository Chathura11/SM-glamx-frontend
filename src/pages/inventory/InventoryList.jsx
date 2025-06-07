import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress
} from '@mui/material';
import axiosInstance from '../../api/api';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/inventories');
        setInventory(response.data.data);
        console.log(response.data.data)
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load inventory');
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <Paper elevation={0} sx={{padding:2}}>

      {loading &&
            <Box sx={{textAlign:'center'}}>
              <LinearProgress color="teal" />
            </Box>}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table aria-label="inventory table">
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No inventory data available
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) =>
                  item.sizes && item.sizes.length > 0 ? (
                    item.sizes.map((sizeItem, idx) => (
                      <TableRow key={`${item._id}-${idx}`}>
                        <TableCell>{item.product?.code|| 'N/A'}</TableCell>
                        <TableCell>{item.product?.name || 'N/A'}</TableCell>
                        <TableCell>{item.product?.category?.name || 'N/A'}</TableCell>
                        <TableCell>{item.product?.brand?.name || 'N/A'}</TableCell>
                        <TableCell>{sizeItem.size || '-'}</TableCell>
                        <TableCell align="right">{sizeItem.quantity}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key={item._id}>
                      <TableCell>{item.product?._id || 'N/A'}</TableCell>
                      <TableCell>{item.product?.name || 'N/A'}</TableCell>
                      <TableCell>{item.product?.category?.name || 'N/A'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">0</TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default InventoryList;
