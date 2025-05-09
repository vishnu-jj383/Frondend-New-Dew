import { createSlice } from "@reduxjs/toolkit";

const sideBarReducer = createSlice({
    name: "sidebar",
    initialState: {
        sideBar: false,
        activeLink: "dashboard",
        subMenu: "",
        isSideBarOpen: false, // Add this
    },
    reducers: {
        toggleSideBar: (state) => {
            state.sideBar = !state.sideBar;
        },
        changeActiveLink : (state, action) => {
            state.activeLink = action?.payload
        },
        changeSubMenu: (state, action) => {
            state.subMenu = action?.payload
        }
    }
});

export const { toggleSideBar, changeActiveLink, changeSubMenu } = sideBarReducer.actions;
export default sideBarReducer.reducer;
