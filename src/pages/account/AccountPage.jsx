import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box,
  Button,
} from '@mui/material';
import axios from '../../api/api'; // Adjust based on your structure
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/accounts/all');
      setAccounts(res.data.accounts);
    } catch (err) {
      console.error('Error fetching accounts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  function handleManageAccount(){
    navigate('/accounts/manage')
  }

  function handleJournal(){
    navigate('/accounts/journal')
  }

  return (
    <Paper sx={{padding:3}}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center" color="primary" mb={4}>
        Account Details
      </Typography>
      <Box sx={{textAlign:'end',mb:2}}>
        <Button variant="contained" sx={{width:'200px',mr:2}} onClick={handleJournal}>
            Journal
        </Button>
        <Button variant="contained" sx={{width:'200px'}} onClick={handleManageAccount}>
            Manage Accounts
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell align="right"><strong>Balance (LKR)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc._id}>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>{acc.type}</TableCell>
                  <TableCell align="right">{acc.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Paper>
  );
};

export default AccountPage;
