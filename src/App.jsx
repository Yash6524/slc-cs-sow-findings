import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { DataProvider } from "./lib/dataContext";
import ListPage from "./pages/ListPage";
import TicketPage from "./pages/TicketPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/ticket/:key" element={<TicketPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/:key" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
