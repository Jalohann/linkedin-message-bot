import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  LinearProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const App = () => {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [useChatGPT, setUseChatGPT] = useState(false);
  const [chatGPTPrompt, setChatGPTPrompt] = useState("");

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        fetchMessages();
      }
    } catch (error) {
      handleError("Error uploading CSV file.");
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5001/messages");
      setMessages(response.data);
    } catch (error) {
      handleError("Error fetching messages.");
    }
  }, []);

  const handleSendMessages = async () => {
    setSending(true);
    const totalMessages = messages.length;

    for (let i = 0; i < totalMessages; i++) {
      try {
        const message = messages[i];
        const response = await axios.post(
          "http://localhost:5001/send-messages",
          { message }
        );
        if (response.status === 200) {
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            if (response.data.status === "Sent without a note") {
              newMessages[i].status = "Sent without a note";
            } else {
              newMessages[i].status = "Sent";
            }
            return newMessages;
          });
        }
        setProgress(((i + 1) / totalMessages) * 100);
      } catch (error) {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[i].status = "Failed";
          newMessages[i].error = error.message;
          return newMessages;
        });
        handleError("Error sending messages.");
      }
    }

    setSending(false);
  };

  const handleDeleteMessage = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5001/messages/${id}`
      );
      if (response.status === 200) {
        fetchMessages();
      }
    } catch (error) {
      handleError("Error deleting message.");
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddMessage = async () => {
    const role = determineRoleFromUrl(profileUrl);
    const messageType = "connection_request";
    const message = useChatGPT
      ? await generateMessageFromChatGPT(chatGPTPrompt)
      : "This is the default message";

    const newMessage = {
      username: extractUsernameFromUrl(profileUrl),
      profileUrl,
      role,
      messageType,
      message,
      status: "Pending",
      error: "",
    };

    try {
      await axios.post("http://localhost:5001/add-message", newMessage);
      fetchMessages();
      handleClose();
    } catch (error) {
      handleError("Error adding message.");
    }
  };

  const extractUsernameFromUrl = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 2] || parts[parts.length - 1];
  };

  const determineRoleFromUrl = (url) => {
    // Add logic to determine the role based on the profile URL
    // For now, let's return a placeholder role
    return "Unknown";
  };

  const generateMessageFromChatGPT = async (prompt) => {
    // Add logic to generate message using ChatGPT
    // For now, let's return a placeholder message
    return "Generated message from ChatGPT";
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        LinkedIn Message Bot
      </Typography>
      <input type="file" onChange={handleFileUpload} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Upload CSV
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={async () => {
          await axios.post("http://localhost:5001/clear-messages");
          fetchMessages();
        }}
      >
        Clear Messages
      </Button>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Add Message
      </Button>
      {sending && <LinearProgress variant="determinate" value={progress} />}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Profile URL</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Message Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Error</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message, index) => (
              <TableRow key={index}>
                <TableCell>{message.username}</TableCell>
                <TableCell>{message.profileUrl}</TableCell>
                <TableCell>{message.role}</TableCell>
                <TableCell>{message.messageType}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    value={message.message}
                    onChange={(e) => {
                      const newMessages = [...messages];
                      newMessages[index].message = e.target.value;
                      setMessages(newMessages);
                    }}
                  />
                </TableCell>
                <TableCell>{message.status}</TableCell>
                <TableCell>{message.error}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteMessage(message._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendMessages}
        disabled={sending}
      >
        Send Messages
      </Button>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add the LinkedIn Profile URL of the individual you want to connect
            with. If you want to add profiles in bulk, create a CSV using the
            appropriate format, or press the advanced button to add profiles in
            bulk.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Profile URL"
            type="url"
            fullWidth
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={useChatGPT}
                onChange={(e) => setUseChatGPT(e.target.checked)}
              />
            }
            label="Use ChatGPT"
          />
          <TextField
            margin="dense"
            label="ChatGPT Prompt"
            type="text"
            fullWidth
            value={chatGPTPrompt}
            onChange={(e) => setChatGPTPrompt(e.target.value)}
            disabled={!useChatGPT}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddMessage} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;