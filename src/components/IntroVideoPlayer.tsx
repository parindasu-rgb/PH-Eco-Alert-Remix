import React from 'react';
import { Video, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface IntroVideoPlayerProps {
  lang: Language;
}

// Direct URL ของวิดีโอแนะนำแอป PH Eco Alert
const VIDEO_URL = 'https://youtu.be/W43F9BC5GVU';

// ฟังก์ชันแปลง YouTube URL เป็น Embed URL สำหรับแสดงผลใน iframe
function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0&modestbranding=1`
    : null;
}

export const IntroVideoPlayer: React.FC<IntroVideoPlayerProps> = ({ lang }) => {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(VIDEO_URL);

  return (
    <div className="w-full flex justify-center my-2">
      <div
        id="intro-video-wrapper"
        className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-3 space-y-2.5"
      >
        {/* หัวข้อวิดีโอแนะนำระบบ */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'th' ? 'วิดีโอแนะนำการใช้งานระบบ' : 'Intro Walkthrough Video'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
            <span>PH Eco Alert</span>
          </span>
        </div>

        {/* กรอบวิดีโอขนาดกลาง 16:9 ควบคุมด้วย Controls */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-slate-200/80">
          {youtubeEmbedUrl ? (
            /* กรณีเป็นลิงก์ YouTube: ใช้ Embedded Player เพื่อให้สามารถเล่นได้โดยตรงในเบราว์เซอร์ */
            <iframe
              id="intro-video-embed"
              src={youtubeEmbedUrl}
              title="PH Eco Alert Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* กรณีเป็น Direct Video URL (เช่น .mp4): ใช้แท็ก <video controls> ตามที่ระบุ */
            <video
              id="intro-video-player"
              controls
              playsInline
              preload="metadata"
              src={VIDEO_URL}
              className="w-full h-full object-cover"
            >
              <source src={VIDEO_URL} type="video/mp4" />
              {lang === 'th'
                ? 'เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้'
                : 'Your browser does not support HTML5 video.'}
            </video>
          )}
        </div>
      </div>
    </div>
  );
};
