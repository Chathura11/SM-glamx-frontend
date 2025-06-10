import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import React from 'react'

function StockEntryDetails({data}) {
  return (
    <Box sx={{ width: 400, p: 3}}>

          {data ? (
            <>
              <Typography>
                <strong>Invoice:</strong> {data.invoiceNumber || 'N/A'}
              </Typography>
              <Typography>
                <strong>Supplier:</strong> {data.supplier?.name || '-'}
              </Typography>
              <Typography>
                <strong>Date:</strong> {new Date(data.date).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Location:</strong> {data.location || '-'}
              </Typography>
              <Typography sx={{ mt: 2, mb: 1 }} variant="subtitle1">
                Items:
              </Typography>

              <Divider />

              <List dense>
                {data.items && data.items.length > 0 ? (
                  data.items.map((item) => (
                    <ListItem key={item._id}>
                      <ListItemText
                        primary={`${item.product?.name || 'Product'} (Size: ${item.size || '-'})`}
                        secondary={`Quantity: ${item.quantity} | Cost Price: Rs. ${item.costPrice.toFixed(
                          2
                        )} | Total: Rs. ${(item.costPrice * item.quantity).toFixed(2)}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No items found for this entry.</Typography>
                )}
              </List>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
    </Box>
  )
}

export default StockEntryDetails