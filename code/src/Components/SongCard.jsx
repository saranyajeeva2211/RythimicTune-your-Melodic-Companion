import React from 'react';
import { FaPlay, FaHeart, FaList } from 'react-icons/fa';

function SongCard({
    song,
    isFavorite,
    isInPlaylist,
    onToggleFavorite,
    onTogglePlaylist,
    onPlay,
    isLoading,
    currentTime,
    duration,
    onSeek,
}) {
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="song-card">
            <div className="card-body">
                <h5 className="card-title">{song.title}</h5>
                <p className="card-text">{song.singer}</p>
                <div className="song-actions">
                    <button
                        className="btn btn-primary"
                        onClick={onPlay}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : <FaPlay />}
                    </button>
                    <button
                        className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => onToggleFavorite(song)}
                    >
                        <FaHeart />
                    </button>
                    <button
                        className={`btn ${isInPlaylist ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => onTogglePlaylist(song)}
                    >
                        <FaList />
                    </button>
                </div>
                {duration > 0 && (
                    <div className="track-container">
                        <input
                            type="range"
                            className="track-bar"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={(e) => onSeek(parseFloat(e.target.value))}
                        />
                        <span className="track-time">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SongCard;