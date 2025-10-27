import React from 'react';
import { MediGenieIcon, InfoIcon, AlertTriangleIcon, ExternalLinkIcon, XIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="mb-3">
    <h3 className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
      {icon}
      <span>{title}</span>
    </h3>
    <div className="text-sm text-slate-700 space-y-2">
      {children}
    </div>
  </div>
);

const SourceLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors group"
    >
      <span className="font-medium">{children}</span>
      <ExternalLinkIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
    </a>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-200 z-50 flex-col shrink-0 flex transition-transform duration-300 ease-in-out md:relative md:w-86 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="complementary"
        aria-label="Information sidebar"
      >
        <header className="p-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                    <MediGenieIcon />
                </div>
                <h1 className="text-xl font-bold text-slate-800">MediGenie</h1>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 text-slate-500 hover:text-slate-800 md:hidden"
              aria-label="Close sidebar"
            >
                <XIcon />
            </button>
        </header>
      
        <div className="flex-1 overflow-y-auto p-5">
            <SidebarSection icon={<InfoIcon className="w-5 h-5 text-slate-400" />} title="About MediGenie">
                <p className="text-slate-600 leading-relaxed">
                    Your personal AI health companion, designed to provide clear, confident first-line health guidance.
                </p>
            </SidebarSection>
            
            <SidebarSection icon={<AlertTriangleIcon className="w-5 h-5 text-slate-400" />} title="When to Seek Help">
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Difficulty breathing</li>
                    <li>Chest pain or pressure</li>
                    <li>Severe bleeding</li>
                    <li>Sudden severe headache</li>
                    <li>Loss of consciousness</li>
                </ul>
                <p className="p-3 bg-red-50 text-red-800 rounded-lg font-medium text-xs">
                    If you experience any of these symptoms, please seek medical help immediately.
                </p>
            </SidebarSection>
            
            <SidebarSection icon={<ExternalLinkIcon className="w-5 h-5 text-slate-400" />} title="Trusted Sources">
                <div className="flex flex-col gap-2">
                    <SourceLink href="https://www.who.int">World Health Organization</SourceLink>
                    <SourceLink href="https://www.cdc.gov">Centers for Disease Control</SourceLink>
                    <SourceLink href="https://www.nhs.uk">UK National Health Service</SourceLink>
                </div>
            </SidebarSection>
        </div>

        <footer className="p-6 border-t border-slate-200 text-xs text-slate-500 bg-slate-50">
            <strong>Disclaimer:</strong> MediGenie is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
        </footer>
      </aside>
    </>
  );
};