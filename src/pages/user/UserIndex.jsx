import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UsersList from './UsersList'
import UserView from './UserView'
import UserForm from './UserForm'

const UserIndex = ({authUser,isLoggedIn}) => {

  return (
    <>
    {isLoggedIn&&authUser&&
      <Routes>
        <Route path="/" element={<UsersList authUser={authUser} isLoggedIn={isLoggedIn}/>}></Route>
        <Route path='/user/:userId' element={<UserView profile={false} authUser={authUser} isLoggedIn={isLoggedIn}/>}></Route>
        <Route path='/user/edit/:userId' element={<UserForm authUser={authUser} profile={false} edit={true}/>}></Route>
      </Routes>
    }
    </>
  )
}

export default UserIndex