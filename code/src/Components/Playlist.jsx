import { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';

function Playlist({ currentSongId, isPlaying, currentTime, duration, playSong, pauseSong, seekTo, setSongList }) {
    const [favorites, setFavorites] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [favRes, playlistRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/favorites'),
                    axios.get('http://localhost:5000/api/playlist'),
                ]);
                setFavorites(favRes.data);
                setPlaylist(playlistRes.data);
                setSongList(playlistRes.data); // Set playlist as song list
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [setSongList]);

    useEffect(() => {
        setSongList(playlist); // Update song list whenever playlist changes
    }, [playlist, setSongList]);

    const toggleFavorite = async (song) => {
        const isFavorite = favorites.some((fav) => fav.id === song.id);
        try {
            if (isFavorite) {
                await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
                setFavorites(favorites.filter((fav) => fav.id !== song.id));
            } else {
                await axios.post('http://localhost:5000/api/favorites', song);
                setFavorites([...favorites, song]);
            }
        } catch (err) {
            console.error('Error updating favorites:', err);
        }
    };

    const togglePlaylist = async (song) => {
        try {
            await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
            setPlaylist(playlist.filter((item) => item.id !== song.id));
        } catch (err) {
            console.error('Error removing from playlist:', err);
        }
    };

    return (
        <div className="playlist container">
            <h1>Playlist</h1>
            <div className="row">
                {playlist.map((song) => (
                    <div className="col" key={song.id}>
                        <SongCard
                            song={song}
                            isFavorite={favorites.some((fav) => fav.id === song.id)}
                            isInPlaylist={true}
                            onToggleFavorite={toggleFavorite}
                            onTogglePlaylist={togglePlaylist}
                            onPlay={() => playSong(song, setIsLoading)}
                            isLoading={currentSongId === song.id && isLoading}
                            currentTime={currentSongId === song.id ? currentTime : 0}
                            duration={currentSongId === song.id ? duration : 0}
                            onSeek={seekTo}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Playlist;