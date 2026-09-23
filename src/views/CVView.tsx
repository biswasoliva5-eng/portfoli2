import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { Download, FileText, Calendar, ExternalLink } from 'lucide-react';

export const CVView: React.FC = () => {
  const { data } = usePortfolio();
  const cv = data?.cv;
  const about = data?.about;
  const artistName = data?.settings.artistName || 'OLIVA BISWAS';

  const downloadUrl = cv?.url || '/uploads/Oliva_Biswas_CV_2025.pdf';
  const hasCV = Boolean(cv && cv.url);

  return (
    <div id="cv-view" className="w-full max-w-3xl pb-24">
      {/* Header with Download CV button */}
      <div className="border-b border-neutral-100 pb-6 mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
            Curriculum Vitae
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Lives and works in {data?.settings.studioLocation || 'Paris and New York'}
          </p>
        </div>

        {/* Clean Download CV Button */}
        <div>
          <a
            id="download-cv-btn"
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={cv?.filename || 'Oliva_Biswas_CV.pdf'}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Structured CV Sections */}
      <div className="space-y-16 text-neutral-800">
        {/* Education */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Education
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <span className="font-medium text-neutral-900">
                MFA in Fine Arts (Painting & Sculpture), Yale School of Art
              </span>
              <span className="text-xs text-neutral-500 font-mono">2018</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <span className="font-medium text-neutral-900">
                BFA in Fine Arts, Rhode Island School of Design (RISD)
              </span>
              <span className="text-xs text-neutral-500 font-mono">2015</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <span className="font-medium text-neutral-900">
                Apprenticeship in Classical Drawing, Studio Simi, Florence
              </span>
              <span className="text-xs text-neutral-500 font-mono">2013</span>
            </div>
          </div>
        </section>

        {/* Solo Exhibitions */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Selected Solo Exhibitions
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">The Material Unconscious</span>, Palais des Arts Contemporains, Paris
              </div>
              <span className="text-xs text-neutral-500 font-mono">2024–2025</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">Vessel and Void: Tactile Geologies</span>, Gallery Modernist, London
              </div>
              <span className="text-xs text-neutral-500 font-mono">2024</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">Forms of Silence</span>, The Drawing Center, New York
              </div>
              <span className="text-xs text-neutral-500 font-mono">2023</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">Mineral Sediments & Carbon</span>, Galerie Noir, Brussels
              </div>
              <span className="text-xs text-neutral-500 font-mono">2021</span>
            </div>
          </div>
        </section>

        {/* Group Exhibitions & Biennials */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Selected Group & Biennial Exhibitions
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">Subterranean Frequencies</span>, 60th International Venice Biennale Collateral Event, Venice
              </div>
              <span className="text-xs text-neutral-500 font-mono">2024</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">Liminal Geographies: Materialities of Absence</span>, Mori Contemporary, Tokyo
              </div>
              <span className="text-xs text-neutral-500 font-mono">2022</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm">
              <div>
                <span className="font-medium text-neutral-900">The Tactile Mark</span>, Hayward Gallery Project Space, London
              </div>
              <span className="text-xs text-neutral-500 font-mono">2020</span>
            </div>
          </div>
        </section>

        {/* Grants & Awards */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Awards, Grants & Fellowships
          </h2>
          <div className="space-y-4 text-sm">
            {about?.awards ? (
              <div className="whitespace-pre-line leading-relaxed text-neutral-800">
                {about.awards}
              </div>
            ) : (
              <div>Pollock-Krasner Foundation Grant (2023)</div>
            )}
          </div>
        </section>

        {/* Residencies */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Residencies
          </h2>
          <div className="space-y-4 text-sm">
            {about?.residencies ? (
              <div className="whitespace-pre-line leading-relaxed text-neutral-800">
                {about.residencies}
              </div>
            ) : (
              <div>Villa Medici, Rome (2024)</div>
            )}
          </div>
        </section>

        {/* Public & Private Collections */}
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
            Selected Permanent Collections
          </h2>
          <div className="space-y-4 text-sm">
            {about?.collections ? (
              <div className="whitespace-pre-line leading-relaxed text-neutral-800">
                {about.collections}
              </div>
            ) : (
              <div>Fondation d Art Contemporain, Paris</div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Download Reminder */}
      <div className="mt-20 pt-8 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-light">
          Complete archival documentation available upon request.
        </span>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={cv?.filename || 'Oliva_Biswas_CV.pdf'}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-900 hover:text-neutral-500 underline underline-offset-4"
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </a>
      </div>
    </div>
  );
};
