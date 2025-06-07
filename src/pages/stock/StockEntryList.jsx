import {
  Paper,
  Stack,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Button,
  Drawer,
  Box
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/api';
import StockEntryForm from './StockEntryForm';
import { useSidePanel } from '../../context/SidePanelContext';

const StockEntryList = () => {
  const [stockEntries, setStockEntries] = useState([]);
  const {openSidePanel} = useSidePanel()

  useEffect(() => {
    fetchStockEntries();
  }, []);

  const fetchStockEntries = async () => {
    try {
      const res = await axiosInstance.get('/stocks/stock-entries');
      setStockEntries(res.data.data);
    } catch (err) {
      console.error('Error fetching stock entries:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await axiosInstance.delete(`/stock-entries/${id}`);
        setStockEntries(prev => prev.filter(entry => entry._id !== id));
      } catch (err) {
        console.error('Error deleting stock entry:', err);
      }
    }
  };

  const handleOpenForm = () => {
    openSidePanel("Add New Stock Entry", <StockEntryForm />);
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Stock Entries</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
            >
              New Entry
            </Button>
          </Stack>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockEntries.map(entry => (
                <TableRow key={entry._id}>
                  <TableCell>{entry.invoiceNumber || 'N/A'}</TableCell>
                  <TableCell>{entry.supplier?.name || '-'}</TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.location || '-'}</TableCell>
                  <TableCell>{entry.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(entry._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </>
  );
};

export default StockEntryList;
