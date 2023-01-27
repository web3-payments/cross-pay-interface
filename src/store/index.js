import { createSlice, configureStore } from '@reduxjs/toolkit';

const initialState = { 
    address: localStorage.getItem("userAddress"), 
    isConnected: !!localStorage.getItem("userAddress"),
    blockchain: localStorage.getItem("blockchain"),
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userAccount(state, action){
            state.address = action.payload;
        },
        blockchain(state, action){
            state.blockchain = action.payload;
        },
        connecion(state){
            state.isConnected = !state.isConnected;
        }
   }
})

const store = configureStore({
    //reducer: { counter: counterSlice.reducer } // could pass other reducers 
    reducer: userSlice.reducer
});

export const userActions = userSlice.actions;

export default store;