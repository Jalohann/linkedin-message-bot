import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const App = () => {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

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
  };

  const fetchMessages = async () => {
    const response = await axios.get("http://localhost:5001/messages");
    setMessages(response.data);
  };

  const handleSendMessages = async () => {
    const response = await axios.post("http://localhost:5001/send-messages");
    if (response.status === 200) {
      fetchMessages();
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        LinkedIn Message Bot
      </Typography>
      <input type="file" onChange={handleFileUpload} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Upload CSV
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Message Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Profile URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Error</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message, index) => (
              <TableRow key={index}>
                <TableCell>{message.username}</TableCell>
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
                <TableCell>{message.profileUrl}</TableCell>
                <TableCell>{message.status}</TableCell>
                <TableCell>{message.error}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSendMessages}
      >
        Send Messages
      </Button>
    </Container>
  );
};

export default App;
