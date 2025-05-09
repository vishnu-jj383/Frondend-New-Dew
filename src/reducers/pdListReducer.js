import { createSlice } from "@reduxjs/toolkit";

const pdListReducer = createSlice({
    name: "pdData",
    initialState: {
        pdListsData: [],
        filteredPdLists: [],
    },
    reducers: {
        addPdLists: (state, action) => {
            state.pdListsData = action.payload
        },
        addFilteredPdLists: (state, action) => {debugger
            state.filteredPdLists = action.payload
        }
    }
})


export const { addPdLists, addFilteredPdLists } = pdListReducer.actions;
export default pdListReducer.reducer;