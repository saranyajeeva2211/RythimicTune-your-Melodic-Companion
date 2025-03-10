import { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';

function Favorites({ currentSongId, isPlaying, currentTime, duration, playSong, pauseSong, seekTo, setSongList }) {
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
                setSongList(favRes.data); // Set favorites as song list
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [setSongList]);

    useEffect(() => {
        setSongList(favorites); // Update song list whenever favorites changes
    }, [favorites, setSongList]);

    const toggleFavorite = async (song) => {
        try {
            await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
            setFavorites(favorites.filter((fav) => fav.id !== song.id));
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    const togglePlaylist = async (song) => {
        const isInPlaylist = playlist.some((item) => item.id === song.id);
        try {
            if (isInPlaylist) {
                await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
                setPlaylist(playlist.filter((item) => item.id !== song.id));
            } else {
                await axios.post('http://localhost:5000/api/playlist', song);
                setPlaylist([...playlist, song]);
            }
        } catch (err) {
            console.error('Error updating playlist:', err);
        }
    };

    return (
        <div className="favorites container">
            <h1>Favorites</h1>
            <div className="row">
                {favorites.map((song) => (
                    <div className="col" key={song.id}>
                        <SongCard
                            song={song}
                            isFavorite={true}
                            isInPlaylist={playlist.some((item) => item.id === song.id)}
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

export default Favorites;