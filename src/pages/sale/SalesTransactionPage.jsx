import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Paper, Grid, Typography, List, ListItem, ListItemText, Box,
  Divider, LinearProgress, TextField, Button, FormControlLabel, Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { teal } from '@mui/material/colors';

const SalesTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await axiosInstance.get('/sales');
      const data = response.data.data;
      setTransactions(data);
      filterTransactions(data, selectedDate, showPendingOnly, showAll, searchText);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (data, date, pendingOnly = false, all = false, search = '') => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    const lowerSearch = search.toLowerCase().trim();

    const filteredData = data.filter((tx) => {
      const dateMatch = all || dayjs(tx.createdAt).format('YYYY-MM-DD') === formatted;
      const pendingMatch = !pendingOnly || tx.status.toLowerCase() === 'pending';
      const searchMatch =
        !lowerSearch ||
        tx._id.toLowerCase().includes(lowerSearch) ||
        tx.customerName?.toLowerCase().includes(lowerSearch);

      return dateMatch && pendingMatch && searchMatch;
    });

    setFiltered(filteredData);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterTransactions(transactions, date, showPendingOnly, showAll, searchText);
  };

  const handlePendingToggle = (event) => {
    const pendingOnly = event.target.checked;
    setShowPendingOnly(pendingOnly);
    filterTransactions(transactions, selectedDate, pendingOnly, showAll, searchText);
  };

  const handleShowAllToggle = (event) => {
    const all = event.target.checked;
    setShowAll(all);
    filterTransactions(transactions, selectedDate, showPendingOnly, all, searchText);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    filterTransactions(transactions, selectedDate, showPendingOnly, showAll, value);
  };

  const handleReverseTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to reverse this transaction?')) return;

    try {
      await axiosInstance.put(`/sales/reverse/${transactionId}`);
      alert('Transaction reversed successfully.');
      await loadTransactions();
    } catch (error) {
      alert('Error reversing transaction.');
    }
  };

  const handleMarkAsCompleted = async (transactionId) => {
    if (!window.confirm('Mark this transaction as completed?')) return;

    try {
      await axiosInstance.put(`/sales/mark-completed/${transactionId}`);
      alert('Transaction marked as completed.');
      await loadTransactions();
    } catch {
      alert('Failed to mark transaction as completed.');
    }
  };

  const exportToExcel = () => {
    const exportData = showAll ? transactions : filtered;

    const detailedSheet = [];
    const summarySheet = [];

    exportData.forEach(tx => {
      tx.items.forEach(item => {
        detailedSheet.push({
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

      summarySheet.push({
        Date: new Date(tx.createdAt).toLocaleString(),
        Customer: tx.customerName || 'Walk-in',
        SoldBy: tx.user?.name || 'Unknown',
        Status: tx.status,
        PaymentMethod: tx.paymentMethod,
        TotalPrice: tx.totalAmount,
        Discount: tx.discount,
        TotalProfit: tx.totalProfit,
      });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(detailedSheet), 'Item Details');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summarySheet), 'Transaction Summary');

    const filename = showAll
      ? `sales_transactions_all_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      : `sales_transactions_${dayjs(selectedDate).format('YYYYMMDD')}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, filename);
  };

  const handlePrintInvoice = (id) => navigate(`/sell/invoice/${id}`);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center" color="primary" mb={4}>
        Sales Transactions
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid size={{ xs:12,sm:6,md:3}}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={showAll}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs:12,sm:6,md:3}}>
          <TextField
            fullWidth
            label="Search by ID or Customer"
            value={searchText}
            onChange={handleSearchChange}
          />
        </Grid>

        <Grid size={{ xs:6,md:2}}>
          <FormControlLabel
            control={<Checkbox checked={showPendingOnly} onChange={handlePendingToggle} />}
            label="Pending Only"
          />
        </Grid>

        <Grid size={{ xs:6,md:2}}>
          <FormControlLabel
            control={<Checkbox checked={showAll} onChange={handleShowAllToggle} />}
            label="Show All"
          />
        </Grid>

        <Grid size={{xs:12,sm:4,md:2}}>
          <Button fullWidth variant="contained" onClick={exportToExcel}>
            Download Excel
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <LinearProgress color="teal"  sx={{ my: 4}} />
      ) : filtered.length === 0 ? (
        <Typography textAlign="center" mt={4}>No transactions found.</Typography>
      ) : (
        <Grid container direction="column" spacing={4}>
          {filtered.map((tx) => (
            <Grid
              container
              key={tx._id}
              spacing={4}
              sx={{ border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff', p: 3 }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs:12,sm:6,md:3}}><strong>Date:</strong> {new Date(tx.createdAt).toLocaleString()}</Grid>
                <Grid size={{ xs:12,sm:6,md:3}}><strong>Customer:</strong> {tx.customerName}</Grid>
                <Grid size={{ xs:12,sm:6,md:3}}><strong>Sold By:</strong> {tx.user?.name}</Grid>
                <Grid size={{ xs:12,sm:6,md:3}}><strong>Status:</strong> {tx.status}</Grid>
                <Grid size={{ xs:6,sm:3}}><strong>Total:</strong> Rs. {tx.totalAmount.toFixed(2)}</Grid>
                <Grid size={{ xs:6,sm:3}}><strong>Discount:</strong> Rs. {tx.discount.toFixed(2)}</Grid>
                <Grid size={{ xs:6,sm:3}}><strong>Profit:</strong> Rs. {tx.totalProfit.toFixed(2)}</Grid>

                {tx.status === 'Pending' && (
                  <Grid size={{ xs:6,sm:3}}>
                    <Button variant="contained" color="success" fullWidth onClick={() => handleMarkAsCompleted(tx._id)}>
                      Mark as Completed
                    </Button>
                  </Grid>
                )}

                <Grid size={{ xs:6,sm:3}}>
                  <Button variant="outlined" color="error" fullWidth disabled={tx.status === 'Cancelled'} onClick={() => handleReverseTransaction(tx._id)}>
                    {tx.status === 'Cancelled' ? 'Cancelled' : 'Reverse'}
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, width: '100%' }} />

              <Box mt={2} width="100%">
                <Typography fontWeight={700}>Items:</Typography>
                <List dense disablePadding>
                  {tx.items.map((item) => (
                    <ListItem key={item._id} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={`${item.product?.name} [ ${item.product?.category?.name} - ${item.product?.brand?.name} ] - (${item.size})`}
                        secondary={`${item.quantity} pcs @ Rs. ${item.sellingPrice.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Button variant="contained" sx={{ mt: 2 }} onClick={() => handlePrintInvoice(tx._id)}>
                Print Invoice
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default SalesTransactionPage;
