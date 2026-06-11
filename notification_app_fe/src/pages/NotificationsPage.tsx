import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Button, Divider, Stack } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import NotificationCard from "../components/NotificationCard";
import { fetchNotifications, Notification, NotificationType } from "../api/notificationApi";
import { useReadNotifications } from "../hooks/useReadNotifications";

const FILTERS: Array<{ label: string; value: NotificationType | "All" }> = [
  { label: "All", value: "All" }, { label: "Placement", value: "Placement" },
  { label: "Result", value: "Result" }, { label: "Event", value: "Event" },
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationType | "All">("All");
  const { isRead, markAsRead, markAllAsRead } = useReadNotifications();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchNotifications(1, 50, filter === "All" ? undefined : filter);
      setNotifications(res.notifications);
    } catch { setError("Failed to load notifications. Is the backend running on port 5000?"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter((n) => !isRead(n.ID)).length;

  return (
    <Box maxWidth={720} mx="auto" px={2} py={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && <Typography variant="caption" color="primary">{unreadCount} unread</Typography>}
        </Box>
        <Button size="small" startIcon={<MarkEmailReadIcon />} onClick={() => markAllAsRead(notifications.map((n) => n.ID))} disabled={unreadCount === 0}>Mark all read</Button>
      </Box>
      <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ mb: 2, flexWrap: "wrap" }}>
        {FILTERS.map((f) => <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>)}
      </ToggleButtonGroup>
      <Divider sx={{ mb: 2 }} />
      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && notifications.length === 0 && <Alert severity="info">No notifications found.</Alert>}
      {!loading && !error && (
        <Stack spacing={0}>
          {notifications.map((n) => <NotificationCard key={n.ID} notification={n} isRead={isRead(n.ID)} onRead={markAsRead} />)}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationsPage;