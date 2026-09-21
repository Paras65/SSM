import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { SchoolMediaVideo } from '../../types';
import { extractYouTubeEmbedInfo, formatYouTubeChannelUrl } from '../../utils/youtube';
import {
  Play,
  X,
  ExternalLink,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Film
} from 'lucide-react';

const DEFAULT_SHOWCASE_VIDEOS: (SchoolMediaVideo & { schoolName: string; branchId: string })[] = [
  {
    id: 'demo-vid-1',
    title: 'वार्षिकोत्सव 2026: सामूहिक सांस्कृतिक नृत्य एवं देशभक्ति नाटक',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'वार्षिकोत्सव',
    description: 'वार्षिक समारोह में भैया-बहिनों द्वारा प्रस्तुत भावपूर्ण नृत्य, राष्ट्रवंदना एवं सांस्कृतिक झांकी।',
    date: '2026-02-15',
    featured: true,
    schoolName: 'गोरखपुर शाखा',
    branchId: 'ssm-gorakhpur'
  },
  {
    id: 'demo-vid-2',
    title: 'वार्षिक क्रीड़ा एवं एथलेटिक्स समारोह 2026 (कबड्डी, खो-खो व दौड़)',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'क्रीड़ा समारोह',
    description: 'शारीरिक विकास एवं सौहार्द हेतु अंतर-सदन पारंपरिक खेलकूद प्रतियोगिता एवं पुरस्कार वितरण।',
    date: '2026-01-20',
    featured: true,
    schoolName: 'गोरखपुर शाखा',
    branchId: 'ssm-gorakhpur'
  },
  {
    id: 'demo-vid-3',
    title: 'प्रातः कालीन दैनिक सरस्वती वंदना, एकात्मता स्तोत्र एवं शांति पाठ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'दैनिक वंदना',
    description: 'प्रातः काल में अनुशासित सामूहिक वंदना, संस्कृत श्लोकोच्चारण एवं योग प्राणायाम अभ्यास।',
    date: '2026-03-01',
    featured: false,
    schoolName: 'दिल्ली शाखा',
    branchId: 'ssm-delhi'
  },
  {
    id: 'demo-vid-4',
    title: 'अखिल भारतीय ज्ञान-विज्ञान मेला एवं वैदिक गणित मॉडल प्रदर्शनी',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'विज्ञान मेला',
    description: 'छात्र-छात्राओं द्वारा निर्मित पर्यावरण संरक्षण, रोबोटिक्स एवं प्राचीन भारतीय गणितीय प्रमेयों की प्रदर्शनी।',
    date: '2025-11-14',
    featured: false,
    schoolName: 'वाराणसी शाखा',
    branchId: 'ssm-varanasi'
  }
];

const CATEGORIES = ['All', 'वार्षिकोत्सव', 'क्रीड़ा समारोह', 'दैनिक वंदना', 'विज्ञान मेला', 'सांस्कृतिक'] as const;

interface VideoShowcaseSectionProps {
  isEmbedded?: boolean;
}

export const VideoShowcaseSection: React.FC<VideoShowcaseSectionProps> = ({ isEmbedded = false }) => {
  const { currentSchool, schools } = useSchool();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePlayingVideo, setActivePlayingVideo] = useState<{
    video: SchoolMediaVideo;
    schoolName: string;
  } | null>(null);

  // Aggregate videos across schools or selected school
  const allAvailableVideos = useMemo(() => {
    const list: (SchoolMediaVideo & { schoolName: string; branchId: string })[] = [];

    // Collect configured videos from active schools
    schools.forEach(sch => {
      if (sch.mediaVideos && sch.mediaVideos.length > 0) {
        sch.mediaVideos.forEach(v => {
          list.push({
            ...v,
            schoolName: sch.hindiName || sch.name,
            branchId: sch.id
          });
        });
      }
    });

    // If no schools have customized videos yet, provide default cultural demo set
    if (list.length === 0) {
      return DEFAULT_SHOWCASE_VIDEOS;
    }

    return list;
  }, [schools]);

  // Filtered by branch and category
  const filteredVideos = useMemo(() => {
    return allAvailableVideos.filter(item => {
      const matchBranch = selectedBranchId === 'all' || item.branchId === selectedBranchId;
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchBranch && matchCategory;
    });
  }, [allAvailableVideos, selectedBranchId, selectedCategory]);

  // Determine active channel link
  const activeSchool = schools.find(s => s.id === selectedBranchId) || currentSchool;
  const channelUrl = activeSchool?.youtubeChannelUrl ? formatYouTubeChannelUrl(activeSchool.youtubeChannelUrl) : '';

  const activeEmbedInfo = activePlayingVideo ? extractYouTubeEmbedInfo(activePlayingVideo.video.youtubeUrl) : null;

  return (
    <div className={isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
      
      {/* Sub-Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        
        {/* Branch Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5 shrink-0">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>शाखा चुनें:</span>
          </span>
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs cursor-pointer"
          >
            <option value="all">🌟 समस्त शाखाएं (All School Branches)</option>
            {schools.filter(s => s.status !== 'discontinued').map(sch => (
              <option key={sch.id} value={sch.id}>
                {sch.hindiName || sch.name} ({sch.city})
              </option>
            ))}
          </select>
        </div>

        {/* Official Channel Link Button */}
        {channelUrl && (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all duration-150 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>🔴 हमारे आधिकारिक YouTube चैनल पर जाएं</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-90" />
          </a>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white shadow-xs scale-105'
                  : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200'
              }`}
            >
              {cat === 'All' ? '🌟 सभी वीडियो' : cat}
            </button>
          );
        })}
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
          <Film className="w-12 h-12 text-stone-300 mx-auto" />
          <h4 className="text-base font-bold text-stone-800">
            इस श्रेणी में कोई वीडियो उपलब्ध नहीं है
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            विद्यालय व्यवस्थापक अपने एडमिन पटल (शाखा सेटिंग्स ➔ मीडिया वीथिका) से YouTube वीडियो जोड़ सकते हैं।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(vid => {
            const embedInfo = extractYouTubeEmbedInfo(vid.youtubeUrl);
            const thumb = embedInfo?.thumbnailUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80';

            return (
              <div
                key={vid.id}
                onClick={() => setActivePlayingVideo({ video: vid, schoolName: vid.schoolName })}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Video Thumbnail Wrapper */}
                <div className="relative aspect-video bg-stone-900 overflow-hidden">
                  <img
                    src={thumb}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Red YouTube Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-red-600 transition-all duration-200">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Category & School Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-amber-300 font-bold text-[10px] border border-white/20">
                      {vid.category}
                    </span>
                    {vid.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black text-[9px] flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>विशेष</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90">
                    <span className="font-semibold truncate flex items-center gap-1 drop-shadow-sm">
                      <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{vid.schoolName}</span>
                    </span>
                    {vid.date && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-stone-300 font-mono">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{vid.date}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-700 transition-colors line-clamp-2 leading-snug">
                    {vid.title}
                  </h4>
                  {vid.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  )}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-700">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 fill-orange-700" />
                      <span>वीडियो चलाएं</span>
                    </span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      HD 1080p
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Responsive Video Playback Modal */}
      {activePlayingVideo && activeEmbedInfo && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActivePlayingVideo(null)}
        >
          <div
            className="bg-stone-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-700 space-y-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-stone-950 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span className="p-1.5 rounded-lg bg-red-600 text-white">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold truncate text-stone-100">
                    {activePlayingVideo.video.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <span>{activePlayingVideo.schoolName}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">{activePlayingVideo.video.category}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePlayingVideo.video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
                  title="YouTube पर खोलें"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActivePlayingVideo(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
                  title="बंद करें (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Responsive 16:9 Iframe Container (Privacy-Enhanced) */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${activeEmbedInfo.embedUrl}&autoplay=1`}
                title={activePlayingVideo.video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Description */}
            {activePlayingVideo.video.description && (
              <div className="p-4 bg-stone-950 border-t border-stone-800 text-xs text-stone-300 leading-relaxed">
                {activePlayingVideo.video.description}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

