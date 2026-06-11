import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Slider, Divider, Stack, Chip } from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import NotificationCard from "../components/NotificationCard";
import { fetchPriorityNotifications, Notification, NotificationType } from "../api/notificationApi";
import { useReadNotifications } from "../hooks/useReadNotifications";

const FILTERS: Array<{ label: string; value: NotificationType | "All" }> = [
  { label: "All", value: "All" }, { label: "Placement", value: "Placement" },
  { label: "Result", value: "Result" }, { label: "Event", value: "Event" },
];

const PriorityPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState(10);
  const [filter, setFilter] = useState<NotificationType | "All">("All");
  const { isRead, markAsRead } = useReadNotifications();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchPriorityNotifications(topN, filter === "All" ? undefined : filter);
      setNotifications(res.notifications);
    } catch { setError("Failed to load priority notifications. Is the backend running on port 5000?"); }
    finally { setLoading(false); }
  }, [topN, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box maxWidth={720} mx="auto" px={2} py={3}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <EmojiObjectsIcon color="warning" />
        <Typography variant="h5" fontWeight={700}>Priority Inbox</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>Ranked: Placement &gt; Result &gt; Event, then by recency.</Typography>
      <Box mb={3}>
        <Typography variant="body2" fontWeight={500} gutterBottom>Show top <Chip label={topN} size="small" color="primary" /> notifications</Typography>
        <Slider value={topN} min={5} max={20} step={5} marks={[{value:5,label:"5"},{value:10,label:"10"},{value:15,label:"15"},{value:20,label:"20"}]} onChange={(_, v) => setTopN(v as number)} sx={{ maxWidth: 300 }} />
      </Box>
      <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ mb: 2, flexWrap: "wrap" }}>
        {FILTERS.map((f) => <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>)}
      </ToggleButtonGroup>
      <Divider sx={{ mb: 2 }} />
      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && notifications.length === 0 && <Alert severity="info">No priority notifications found.</Alert>}
      {!loading && !error && (
        <Stack spacing={0}>
          {notifications.map((n, idx) => (
            <Box key={n.ID} display="flex" alignItems="flex-start" gap={1}>
              <Typography variant="caption" color="text.secondary" sx={{ pt: 2, minWidth: 24, fontWeight: 700 }}>#{idx + 1}</Typography>
              <Box flex={1}><NotificationCard notification={n} isRead={isRead(n.ID)} onRead={markAsRead} /></Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PriorityPage;