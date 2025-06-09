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

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await axiosInstance.get('/sales');
        const data = response.data.data;
        setTransactions(data);
        filterByDate(data, selectedDate);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filterByDate = (data, date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    const filteredData = data.filter((tx) =>
      dayjs(tx.createdAt).format('YYYY-MM-DD') === formatted
    );
    setFiltered(filteredData);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterByDate(transactions, date);
  };

  const exportToExcel = () => {
    const excelData = [];
  
    transactions.forEach(tx => {
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
          Profit: (item.sellingPrice - item.costPrice) * item.quantity
        });
      });
    });
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  
    const blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
  
    saveAs(blob, `sales_transactions_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

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
      <Grid container direction="row" justifySelf='end' spacing={4}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ mb: 3, maxWidth: 300 }} />
            )}
          />
        </LocalizationProvider>

        <Box sx={{justifyItems:'end'}}>
          <Button onClick={exportToExcel} style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Download All Transactions
          </Button>
        </Box>
      </Grid>      
      {loading ? (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LinearProgress color="primary" />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography variant="body1" textAlign="center" mt={4}>
          No transactions found for selected date.
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
