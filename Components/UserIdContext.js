import React from 'react';

export const UserIdContext = React.createContext({
    userId: null,
    userRole: null,
    userName: null,
    parentId: null,
    setUserId: () => {
    },
    setUserRole: () => {
    },
    setUserName: () => {
    },
    setParentId: () => {
    },
});