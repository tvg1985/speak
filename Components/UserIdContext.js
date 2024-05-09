import React from 'react';

export const UserIdContext = React.createContext({
    userId: null,
    userRole: null,
    userName: null,
    setUserId: () => {
    },
    setUserRole: () => {
    },
    setUserName: () => {
    },
});