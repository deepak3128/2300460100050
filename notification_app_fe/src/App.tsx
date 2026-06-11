import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import NotificationsPage from "./pages/NotificationsPage";
import PriorityPage from "./pages/PriorityPage";
import { initFrontendLogger } from "./utils/logger";

initFrontendLogger(process.env.REACT_APP_AUTH_TOKEN || "");

const theme = createTheme({
  palette: { primary: { main: "#1976d2" }, background: { default: "#f5f7fa" } },
  typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
});

function NavTabs() {
  const location = useLocation();
  const value = location.pathname === "/priority" ? 1 : 0;
  return (
    <Tabs value={value} textColor="inherit" indicatorColor="secondary">
      <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="All Notifications" component={NavLink} to="/" />
      <Tab icon={<EmojiObjectsIcon fontSize="small" />} iconPosition="start" label="Priority Inbox" component={NavLink} to="/priority" />
    </Tabs>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="sticky" elevation={1}>
          <Toolbar sx={{ gap: 2 }}>
            <NotificationsIcon />
            <Typography variant="h6" fontWeight={700} sx={{ mr: 2 }}>CampusNotify</Typography>
            <NavTabs />
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<NotificationsPage />} />
            <Route path="/priority" element={<PriorityPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;