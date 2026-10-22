import React, { useState } from 'react';
import { Play, Pause, ExternalLink, Disc, Music, Volume2 } from 'lucide-react';

interface Track {
  title: string;
  duration: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  role: string;
  cover: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  tracks?: Track[];
}

interface DiscographySectionProps {
  content: {
    description?: string;
    albums?: Album[];
  };
  title?: string;
  subtitle?: string;
}

export const DiscographySection: React.FC<DiscographySectionProps> = ({ content, title, subtitle }) => {
  const [playingTrack, setPlayingTrack] = useState<{ albumId: string; trackIndex: number } | null>(null);

  const togglePlay = (albumId: string, trackIndex: number) => {
    if (playingTrack && playingTrack.albumId === albumId && playingTrack.trackIndex === trackIndex) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack({ albumId, trackIndex });
    }
  };

  const albums = content.albums || [];

  return (
    <section id="discografia" className="py-20 border-b border-slate-800/80 bg-[#0b0c12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
              Catálogo Musical
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
              {title || 'Discografía & Producciones Selectas'}
            </h2>
            {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
          </div>
          {playingTrack && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
              <Volume2 className="w-4 h-4 animate-pulse text-amber-400" />
              <span>Reproduciendo muestra de audio</span>
              <button
                onClick={() => setPlayingTrack(null)}
                className="text-xs text-slate-400 hover:text-white ml-2 underline cursor-pointer"
              >
                Detener
              </button>
            </div>
          )}
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album) => {
            const isAlbumPlaying = playingTrack?.albumId === album.id;

            return (
              <div
                key={album.id}
                className="bg-[#13151f] border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all duration-300 group"
              >
                {/* Cover artwork */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                  <img
                    src={album.cover}
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-amber-300 border border-white/10">
                    {album.year}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                      {album.role}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight truncate font-serif">
                      {album.title}
                    </h3>
                    <p className="text-xs text-slate-300 truncate">{album.artist}</p>
                  </div>
                </div>

                {/* Tracklist and links */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {album.tracks && album.tracks.length > 0 && (
                    <div className="space-y-1.5 mb-5">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                        Pistas Destacadas
                      </p>
                      {album.tracks.map((track, tIdx) => {
                        const isThisPlaying = isAlbumPlaying && playingTrack?.trackIndex === tIdx;

                        return (
                          <div
                            key={tIdx}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                              isThisPlaying
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                            onClick={() => togglePlay(album.id, tIdx)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <button
                                aria-label={isThisPlaying ? 'Pausar muestra' : 'Reproducir muestra'}
                                className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors shrink-0"
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-3 h-3 fill-current" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current ml-0.5" />
                                )}
                              </button>
                              <span className="truncate">{track.title}</span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                              {track.duration}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Streaming platform links */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">Escuchar en:</span>
                    <div className="flex items-center gap-3">
                      {album.spotifyUrl && (
                        <a
                          href={album.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                        >
                          <span>Spotify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {album.appleUrl && (
                        <a
                          href={album.appleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-pink-400 transition-colors flex items-center gap-1"
                        >
                          <span>Apple Music</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
