import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Typography, Paper, Divider, Stack } from '@mui/material';
import axiosInstance from '../../api/api';
import { useReactToPrint } from 'react-to-print';
import logo from '../../assets/logo1.png'
import logoName from '../../assets/glamx.png'

const InvoicePage = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [items, setItems] = useState([]);
  const componentRef = useRef();

  useEffect(() => {
    axiosInstance.get(`/sales/${id}`)
      .then(res => {
        setTransaction(res.data.transaction);
        setItems(res.data.items);
      })
      .catch(err => {
        console.error("Failed to fetch invoice:", err);
      });
  }, [id]);

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice_${id}`,
    contentRef: componentRef,
  });

  if (!transaction) return <Typography>Loading invoice...</Typography>;

  const total = items.reduce((sum, item) =>
    sum + item.quantity * item.sellingPrice, 0);
  const netTotal = total - transaction.discount;

  return (
    <Paper sx={{ p: 4 }}>
      <div ref={componentRef}>
        <Stack direction='column' sx={{textAlign:'center',backgroundColor:'#27548A',justifyItems:'center',alignItems:'center',width:'300px',justifySelf:'left'}}>
            <img src={logo} alt="logo" style={{ width: "100px"}} />
            <img src={logoName} alt="logo" style={{ width: "200px"}} />
        </Stack>
        <Typography variant="h4" align="center">INVOICE</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography><strong>Invoice ID:</strong> {transaction._id}</Typography>
        <Typography><strong>Customer:</strong> {transaction.customerName || 'Walk-in'}</Typography>
        <Typography><strong>Cashier:</strong> {transaction.user?.username}</Typography>
        <Typography><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</Typography>
        <Typography><strong>Payment:</strong> {transaction.paymentMethod}</Typography>
        <Typography><strong>Status:</strong> {transaction.status}</Typography>
        <Divider sx={{ my: 2 }} />

        <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.product.name}</td>
                <td>{item.product.category.name}</td>
                <td>{item.product.brand.name}</td>
                <td>{item.size}</td>
                <td>{item.quantity}</td>
                <td>Rs. {item.sellingPrice.toFixed(2)}</td>
                <td>Rs. {(item.quantity * item.sellingPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Divider sx={{ my: 2 }} />
        <Typography><strong>Subtotal:</strong> Rs. {total.toFixed(2)}</Typography>
        <Typography><strong>Discount:</strong> Rs. {transaction.discount.toFixed(2)}</Typography>
        <Typography variant="h6"><strong>Net Total:</strong> Rs. {netTotal.toFixed(2)}</Typography>

        <Typography variant="body2" align="center" sx={{ mt: 4, fontStyle: 'italic' }}>
            Thank you for choosing Glam'x – Your style, our passion!
        </Typography>
      </div>

      <Button variant="contained" color="primary" onClick={handlePrint} sx={{ mt: 3 }}>
        Download as PDF
      </Button>
    </Paper>
  );
};

export default InvoicePage;
