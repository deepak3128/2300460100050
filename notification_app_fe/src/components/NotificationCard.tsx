import React from "react";
import { Card, CardContent, Typography, Chip, Box, Tooltip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventIcon from "@mui/icons-material/Event";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Notification, NotificationType } from "../api/notificationApi";

interface Props { notification: Notification; isRead: boolean; onRead: (id: string) => void; }

const TYPE_CONFIG: Record<NotificationType, { color: "success" | "warning" | "info"; icon: React.ReactNode; }> = {
  Placement: { color: "success", icon: <WorkIcon fontSize="small" /> },
  Result: { color: "warning", icon: <EmojiEventsIcon fontSize="small" /> },
  Event: { color: "info", icon: <EventIcon fontSize="small" /> },
};

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const NotificationCard: React.FC<Props> = ({ notification, isRead, onRead }) => {
  const { color, icon } = TYPE_CONFIG[notification.Type];
  return (
    <Card onClick={() => onRead(notification.ID)} sx={{ mb: 1.5, cursor: "pointer", border: isRead ? "1px solid #e0e0e0" : "1px solid #1976d2", bgcolor: isRead ? "background.paper" : "#f0f7ff", "&:hover": { boxShadow: 3 } }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            {!isRead && <Tooltip title="Unread"><FiberManualRecordIcon sx={{ fontSize: 10, color: "#1976d2", flexShrink: 0 }} /></Tooltip>}
            <Typography variant="body1" fontWeight={isRead ? 400 : 600} sx={{ textTransform: "capitalize" }}>{notification.Message}</Typography>
          </Box>
          <Chip icon={icon as React.ReactElement} label={notification.Type} color={color} size="small" variant="outlined" sx={{ ml: 1 }} />
        </Box>
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">{formatTimestamp(notification.Timestamp)}</Typography>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;