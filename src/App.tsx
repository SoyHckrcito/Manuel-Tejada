/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { useActivityTracker } from './hooks/useActivityTracker.ts';
import { api } from './lib/api.ts';
import { SiteContentData } from './types.ts';
import { initialSiteContent } from './server/defaultContent.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/sections/HeroSection.tsx';
import { BioSection } from './components/sections/BioSection.tsx';
import { DiscographySection } from './components/sections/DiscographySection.tsx';
import { WorksSection } from './components/sections/WorksSection.tsx';
import { AnnouncementsSection } from './components/sections/AnnouncementsSection.tsx';
import { StudioSection } from './components/sections/StudioSection.tsx';
import { VideosSection } from './components/sections/VideosSection.tsx';
import { GallerySection } from './components/sections/GallerySection.tsx';
import { ContactSection } from './components/sections/ContactSection.tsx';
import { Footer } from './components/sections/Footer.tsx';
import { AuthModals } from './components/auth/AuthModals.tsx';
import { LegalModal } from './components/legal/LegalModal.tsx';
import { AdminVisualPanel } from './components/admin/AdminVisualPanel.tsx';
import { Sliders, Sparkles, AlertCircle } from 'lucide-react';

const MainApp: React.FC = () => {
  useActivityTracker();
  const { user, canAccessAdmin, isOwner, isAdmin, isModerator } = useAuth();

  const [siteContentData, setSiteContentData] = useState<SiteContentData>(initialSiteContent);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoadingContent(true);
      const res = await api.content.get(false);
      if (res.content) {
        setSiteContentData(res.content);
      }
    } catch (err: any) {
      console.warn('Error fetching content, using initial preset:', err);
      // Fallback is already initialSiteContent
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Sort sections by order
  const activeSections = [...(siteContentData.sections || [])]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200"
      style={{
        backgroundColor: siteContentData.theme?.bgCanvas || '#090a0f',
        fontFamily: siteContentData.theme?.fontFamily || 'Plus Jakarta Sans',
      }}
    >
      {/* Floating Admin Trigger Bar (Exclusive to authorized roles: OWNER, ADMIN, MODERATOR) */}
      {canAccessAdmin && !isAdminPanelOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={() => setIsAdminPanelOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer border border-amber-300"
          >
            <Sliders className="w-4 h-4" />
            <span>Panel de Administración ({user?.role})</span>
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        brandName={siteContentData.navigation?.brandName}
        links={siteContentData.navigation?.links}
      />

      {/* Render Dynamic Sections in Configured Order */}
      <main className="flex-1">
        {activeSections.map((sec) => {
          switch (sec.type) {
            case 'hero':
              return <HeroSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'bio':
              return <BioSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'discography':
              return <DiscographySection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'works':
              return <WorksSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'announcements':
              return <AnnouncementsSection key={sec.id} title={sec.title} subtitle={sec.subtitle} />;
            case 'studio':
              return <StudioSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'videos':
              return <VideosSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'gallery':
              return <GallerySection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'contact':
              return <ContactSection key={sec.id} content={sec.content} title={sec.title} subtitle={sec.subtitle} />;
            case 'custom':
              return (
                <section key={sec.id} className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                      <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
                        Sección Especial
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                        {sec.title}
                      </h2>
                      {sec.subtitle && <p className="text-sm text-slate-400 mt-2">{sec.subtitle}</p>}
                      <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed">
                        {sec.content.leadText || 'Contenido personalizado administrable desde el panel.'}
                      </p>
                      {sec.content.buttonText && (
                        <div className="mt-6">
                          <a
                            href={sec.content.buttonLink || '#'}
                            className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
                          >
                            {sec.content.buttonText}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modals (Login, Register, Profile, Recovery) */}
      <AuthModals />

      {/* Legal & Transparency Modal */}
      <LegalModal />

      {/* Visual Admin Panel */}
      {isAdminPanelOpen && (
        <AdminVisualPanel
          content={siteContentData}
          onContentChange={(newContent) => setSiteContentData(newContent)}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
