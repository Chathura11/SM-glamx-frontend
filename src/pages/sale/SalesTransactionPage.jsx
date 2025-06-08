import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/api';
import {
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  LinearProgress,
} from '@mui/material';

const SalesTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await axiosInstance.get('/sales');
        setTransactions(response.data.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={700}
        textAlign="center"
        color="primary"
        mb={4}
      >
        Sales Transactions
      </Typography>

      {loading && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LinearProgress color="primary" />
        </Box>
      )}

      {transactions.length === 0 ? (
        <Typography variant="body1" textAlign="center" mt={4}>
          No transactions found.
        </Typography>
      ) : (
        <Grid container direction="column" spacing={4}>
          {transactions.map((tx) => (
            <Grid
              container
              key={tx._id}
              spacing={4}
              sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                backgroundColor: '#fff',
                p: 3,
                boxShadow: '0 2px 6px rgb(0 0 0 / 0.1)',
              }}
            >
              {/* Transaction details row */}
              <Grid container spacing={4} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(tx.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {tx.customerName || 'Walk-in'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Sold By
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {tx.user?.name || 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={
                      tx.status.toLowerCase() === 'completed'
                        ? 'success.main'
                        : 'warning.main'
                    }
                  >
                    {tx.status}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Total Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Rs. {tx.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Discount
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    Rs. {tx.discount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight={700}
                    gutterBottom
                  >
                    Profit
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    Rs. {tx.totalProfit.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              {/* Items List */}
              <Box mt={2} width="100%">
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Items
                </Typography>
                <List dense disablePadding>
                  {tx.items.map((item) => (
                    <ListItem key={item._id} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={`${item.product?.name} (Size: ${item.size})`}
                        secondary={`${item.quantity} pcs @ Rs. ${item.sellingPrice.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default SalesTransactionPage;
