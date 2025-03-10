import React, { useState, useEffect, useRef, Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './Components/Sidebar.jsx';
import Songs from './Components/Songs.jsx';
import Favorites from './Components/Favorites.jsx';
import Playlist from './Components/Playlist.jsx';
import { FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './App.css';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';
playerContainer.style.display = 'none';
document.body.appendChild(playerContainer);

class ErrorBoundary extends Component {
    state = { hasError: false, error: null, errorInfo: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-message">
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.toString() || 'Unknown error occurred'}</p>
                    <pre>{this.state.errorInfo?.componentStack || 'No stack trace available'}</pre>
                    <p>Please refresh the page or try again later.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [currentSongId, setCurrentSongId] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [songList, setSongList] = useState([]); // Store the active song list
    const playerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth > 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadYouTubeAPI = () => {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubeIframeAPIReady = () => {
                    console.log('YouTube API ready');
                    initPlayer();
                };
            } else {
                initPlayer();
            }
        };

        loadYouTubeAPI();

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);

    const initPlayer = () => {
        if (playerRef.current) {
            console.log('Player already initialized');
            return;
        }

        try {
            playerRef.current = new window.YT.Player(playerContainer, {
                height: '0',
                width: '0',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: (event) => {
                        console.error('Player error:', event.data);
                        playNextSong(); // Move to next song on error
                    },
                },
            });
            console.log('Player initialized');
        } catch (error) {
            console.error('Error initializing player:', error);
        }
    };

    const onPlayerReady = (event) => {
        console.log('Player ready');
    };

    const onPlayerStateChange = (event) => {
        console.log('Player state:', event.data);
        switch (event.data) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                const newDuration = event.target.getDuration();
                setDuration(newDuration);
                const updateTime = () => {
                    if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                        const time = playerRef.current.getCurrentTime();
                        setCurrentTime(time);
                        requestAnimationFrame(updateTime);
                    }
                };
                requestAnimationFrame(updateTime);
                break;
            case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                setCurrentTime(event.target.getCurrentTime());
                break;
            case window.YT.PlayerState.ENDED:
                console.log('Song ended, moving to next');
                playNextSong();
                break;
            default:
                break;
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            console.log('Toggling sidebar, new state:', !prev);
            return !prev;
        });
    };

    const playSong = async (song, setIsLoading) => {
        console.log('Attempting to play song:', song.title);
        if (currentSongId === song.id && isPlaying) {
            pauseSong();
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/youtube/${encodeURIComponent(song.title)}/${encodeURIComponent(song.singer)}`
            );
            const videoId = response.data.videoId;
            console.log('Fetched videoId:', videoId);

            if (!playerRef.current) {
                console.error('Player not ready, initializing...');
                initPlayer();
                setTimeout(() => {
                    if (playerRef.current) {
                        playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
                        setCurrentSongId(song.id);
                        setCurrentSong(song);
                        setIsPlaying(true);
                        console.log('Playing song:', song.title);
                    } else {
                        console.error('Player still not ready after timeout');
                    }
                }, 500);
            } else {
                playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
                setCurrentSongId(song.id);
                setCurrentSong(song);
                setIsPlaying(true);
                console.log('Playing song:', song.title);
            }
            setCurrentTime(0);
            setDuration(0);
        } catch (error) {
            console.error('Error playing song:', error);
            setCurrentSongId(null);
            setCurrentSong(null);
            setIsPlaying(false);
            playNextSong(); // Move to next song on error
        } finally {
            setIsLoading(false);
        }
    };

    const pauseSong = () => {
        if (playerRef.current && isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            console.log('Song paused');
        }
    };

    const seekTo = (time) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);
            if (!isPlaying) {
                playerRef.current.playVideo();
                setIsPlaying(true);
            }
            console.log('Seek to:', time);
        }
    };

    const playNextSong = () => {
        if (!songList.length) {
            console.log('No songs in list, stopping playback');
            setCurrentSongId(null);
            setCurrentSong(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            return;
        }

        const currentIndex = songList.findIndex(song => song.id === currentSongId);
        let nextIndex = currentIndex + 1;
        if (nextIndex >= songList.length) {
            nextIndex = 0; // Loop back to start
        }

        const nextSong = songList[nextIndex];
        if (nextSong) {
            console.log('Playing next song:', nextSong.title);
            playSong(nextSong, () => {}); // Use an empty setIsLoading since it's internal
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <Router>
            <div className="app">
                <Sidebar isOpen={isSidebarOpen} />
                <div className={`main-content ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
                    <button
                        onClick={toggleSidebar}
                        className="btn btn-secondary toggle-sidebar-btn"
                        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                        aria-expanded={isSidebarOpen}
                    >
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <ErrorBoundary>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <Songs
                                        currentSongId={currentSongId}
                                        isPlaying={isPlaying}
                                        currentTime={currentTime}
                                        duration={duration}
                                        playSong={playSong}
                                        pauseSong={pauseSong}
                                        seekTo={seekTo}
                                        setSongList={setSongList} // Pass song list updater
                                    />
                                }
                            />
                            <Route
                                path="/favorites"
                                element={
                                    <Favorites
                                        currentSongId={currentSongId}
                                        isPlaying={isPlaying}
                                        currentTime={currentTime}
                                        duration={duration}
                                        playSong={playSong}
                                        pauseSong={pauseSong}
                                        seekTo={seekTo}
                                        setSongList={setSongList}
                                    />
                                }
                            />
                            <Route
                                path="/playlist"
                                element={
                                    <Playlist
                                        currentSongId={currentSongId}
                                        isPlaying={isPlaying}
                                        currentTime={currentTime}
                                        duration={duration}
                                        playSong={playSong}
                                        pauseSong={pauseSong}
                                        seekTo={seekTo}
                                        setSongList={setSongList}
                                    />
                                }
                            />
                        </Routes>
                    </ErrorBoundary>
                    {currentSong && (
                        <div className="current-song-bar">
                            <div className="song-info">
                                <span className="song-title">{currentSong.title}</span>
                                <span className="song-singer">{currentSong.singer}</span>
                            </div>
                            <div className="player-controls">
                                <button
                                    className="btn btn-primary"
                                    onClick={isPlaying ? pauseSong : () => playSong(currentSong, () => {})}
                                >
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={playNextSong}
                                >
                                    Next
                                </button>
                                <div className="track-container">
                                    <input
                                        type="range"
                                        className="track-bar"
                                        min="0"
                                        max={duration || 100}
                                        value={currentTime || 0}
                                        onChange={(e) => seekTo(parseFloat(e.target.value))}
                                    />
                                    <span className="track-time">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Router>
    );
}

export default App;