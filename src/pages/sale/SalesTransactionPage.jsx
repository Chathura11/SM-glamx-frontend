import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const SalesTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await axiosInstance.get('/sales');
      const data = response.data.data;
      setTransactions(data);
      filterTransactions(data, selectedDate, showPendingOnly, showAll);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (data, date, pendingOnly = false, all = false) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    const filteredData = data.filter((tx) =>
      (all || dayjs(tx.createdAt).format('YYYY-MM-DD') === formatted) &&
      (!pendingOnly || tx.status.toLowerCase() === 'pending')
    );
    setFiltered(filteredData);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterTransactions(transactions, date, showPendingOnly, showAll);
  };

  const handlePendingToggle = (event) => {
    const pendingOnly = event.target.checked;
    setShowPendingOnly(pendingOnly);
    filterTransactions(transactions, selectedDate, pendingOnly, showAll);
  };

  const handleShowAllToggle = (event) => {
    const all = event.target.checked;
    setShowAll(all);
    filterTransactions(transactions, selectedDate, showPendingOnly, all);
  };

  const handleReverseTransaction = async (transactionId) => {
    const confirm = window.confirm('Are you sure you want to reverse this transaction?');
    if (!confirm) return;

    try {
      await axiosInstance.put(`/sales/reverse/${transactionId}`);
      alert('Transaction reversed successfully.');
      await loadTransactions();
    } catch (error) {
      console.error('Error reversing transaction:', error);
      alert('Error reversing transaction.');
    }
  };

  const handleMarkAsCompleted = async (transactionId) => {
    const confirm = window.confirm('Mark this transaction as completed?');
    if (!confirm) return;

    try {
      await axiosInstance.put(`/sales/mark-completed/${transactionId}`);
      alert('Transaction marked as completed successfully.');
      await loadTransactions();
    } catch (error) {
      console.error('Error marking transaction as completed:', error);
      alert('Failed to mark transaction as completed.');
    }
  };

  const exportToExcel = () => {
    const exportData = showAll ? transactions : filtered;
  
    const excelData = [];
  
    exportData.forEach(tx => {
      tx.items.forEach(item => {
        excelData.push({
          Date: new Date(tx.createdAt).toLocaleString(),
          Customer: tx.customerName || 'Walk-in',
          SoldBy: tx.user?.name || 'Unknown',
          Status: tx.status,
          PaymentMethod: tx.paymentMethod,
          Product: item.product?.name,
          Category: item.product?.category?.name,
          Brand: item.product?.brand?.name,
          Size: item.size,
          Quantity: item.quantity,
          SellingPrice: item.sellingPrice,
          CostPrice: item.costPrice,
          Profit: (item.sellingPrice - item.costPrice) * item.quantity,
        });
      });
    });
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
    const filename = showAll
      ? `sales_transactions_all_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      : `sales_transactions_${dayjs(selectedDate).format('YYYYMMDD')}.xlsx`;
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
  
    saveAs(blob, filename);
  };
  

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center" color="primary" mb={4}>
        Sales Transactions
      </Typography>

      <Grid container direction="row" spacing={2} alignItems="center">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            disabled={showAll}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ mb: 3, maxWidth: 300 }} />
            )}
          />
        </LocalizationProvider>

        <FormControlLabel
          control={
            <Checkbox
              checked={showPendingOnly}
              onChange={handlePendingToggle}
              color="primary"
            />
          }
          label="Show only Pending Orders"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={showAll}
              onChange={handleShowAllToggle}
              color="primary"
            />
          }
          label="Show All Transactions"
        />

        <Box>
          <Button
            onClick={exportToExcel}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download Excel
          </Button>
        </Box>
      </Grid>

      {loading ? (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LinearProgress color="teal" />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography variant="body1" textAlign="center" mt={4}>
          No transactions found.
        </Typography>
      ) : (
        <Grid container direction="column" spacing={4}>
          {filtered.map((tx) => (
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
              <Grid container spacing={4} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatDate(tx.createdAt)}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Customer</Typography>
                  <Typography variant="body2" fontWeight={600}>{tx.customerName || 'Walk-in'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Sold By</Typography>
                  <Typography variant="body2" fontWeight={600}>{tx.user?.name || 'Unknown'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Status</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={
                      tx.status.toLowerCase() === 'completed'
                        ? 'success.main'
                        : tx.status.toLowerCase() === 'pending'
                          ? 'warning.main'
                          : 'error.main'
                    }
                  >
                    {tx.status}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Total Amount</Typography>
                  <Typography variant="body2" fontWeight={600}>Rs. {tx.totalAmount.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Discount</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">Rs. {tx.discount.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={12} sm={4} md={4} lg={2.4}>
                  <Typography variant="caption" fontWeight={700}>Profit</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">Rs. {tx.totalProfit.toFixed(2)}</Typography>
                </Grid>

                {tx.status === 'Pending' && (
                  <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Button variant="contained" color="success" fullWidth onClick={() => handleMarkAsCompleted(tx._id)}>
                      Mark as Completed
                    </Button>
                  </Grid>
                )}

                <Grid item xs={12} sm={6} md={6} lg={3}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={tx.status === 'Cancelled'}
                    onClick={() => handleReverseTransaction(tx._id)}
                  >
                    {tx.status === 'Cancelled' ? 'Cancelled' : 'Reverse Transaction'}
                  </Button>
                </Grid>
              </Grid>

              <Divider />

              <Box mt={2} width="100%">
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Items
                </Typography>
                <List dense disablePadding>
                  {tx.items.map((item) => (
                    <ListItem key={item._id} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={`${item.product?.name} | ${item.product?.category?.name} | ${item.product?.brand?.name} (Size: ${item.size})`}
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
