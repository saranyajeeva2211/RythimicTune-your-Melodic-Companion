import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import youtubesearchapi from 'yt-search';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load song data from db.json
const loadSongs = async () => {
  try {
    const data = await fs.readFile('./public/db.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading db.json:', error);
    return { items: [], favorities: [], playlist: [] };
  }
};

// Save song data to db.json
const saveSongs = async (data) => {
  try {
    await fs.writeFile('./public/db.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving db.json:', error);
  }
};

// Get all songs
app.get('/api/songs', async (req, res) => {
  const data = await loadSongs();
  res.json(data.items);
});

// Get favorites
app.get('/api/favorites', async (req, res) => {
  const data = await loadSongs();
  res.json(data.favorities);
});

// Get playlist
app.get('/api/playlist', async (req, res) => {
  const data = await loadSongs();
  res.json(data.playlist);
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
  const song = req.body;
  const data = await loadSongs();
  if (!data.favorities.some((fav) => fav.id === song.id)) {
    data.favorities.push(song);
    await saveSongs(data);
  }
  res.json(data.favorities);
});

// Add to playlist
app.post('/api/playlist', async (req, res) => {
  const song = req.body;
  const data = await loadSongs();
  if (!data.playlist.some((item) => item.id === song.id)) {
    data.playlist.push(song);
    await saveSongs(data);
  }
  res.json(data.playlist);
});

// Remove from favorites
app.delete('/api/favorites/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await loadSongs();
  data.favorities = data.favorities.filter((fav) => fav.id !== id);
  await saveSongs(data);
  res.json(data.favorities);
});

// Remove from playlist
app.delete('/api/playlist/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await loadSongs();
  data.playlist = data.playlist.filter((item) => item.id !== id);
  await saveSongs(data);
  res.json(data.playlist);
});

// Fetch YouTube URL for a song
app.get('/api/youtube/:title/:singer', async (req, res) => {
  const { title, singer } = req.params;
  try {
    const searchQuery = `${title} ${singer} official audio`;
    const result = await youtubesearchapi(searchQuery);
    const video = result.videos[0]; // Get the first result
    if (video) {
      res.json({ url: video.url, videoId: video.videoId });
    } else {
      res.status(404).json({ error: 'No video found' });
    }
  } catch (error) {
    console.error('Error fetching YouTube URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});