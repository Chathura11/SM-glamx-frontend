import { Stack } from '@mui/material'
import React from 'react'
import SaleHeader from './SaleHeader'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Route, Routes } from 'react-router-dom';
import SaleContent from './SaleContent';
import SalesPage from './SalePage';

const SaleIndex = ({isLoggedIn,authUser}) => {

    const stackStyle={
        margin:'20px 0',
    }

  return (
    <Stack style={stackStyle} spacing={2}>
        <SaleHeader tag={'Sales'} icon={<AddShoppingCartIcon  sx={{width: 40, height: 40}}/>}/>  
            {isLoggedIn&&authUser&&
                <Routes>
                    {/* <Route path='/' element={<SaleContent authUser={authUser}/>}></Route> */}
                    <Route path='/' element={<SalesPage authUser={authUser}/>}></Route>
                </Routes>
            }
    </Stack>
  )
}

export default SaleIndex