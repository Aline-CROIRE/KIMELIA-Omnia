// src/components/KIMELIAOmniaLogo.jsx
import React, { useRef } from 'react';
import styled from 'styled-components';
import { toPng } from 'html-to-image';
import KIMELIAOmniaIcon from './KIMELIAOmniaIcon';
import KIMELIAOmniaText from './KIMELIAOmniaText';
import { colors, fonts } from '../theme';

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  height: fit-content;
`;

const DownloadButton = styled.button`
  background-color: ${colors.primaryPurple};
  color: ${colors.lightGrey};
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-family: ${fonts.secondary};
  font-size: 0.9rem;
  margin: 5px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.accentTeal};
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 20px;
  justify-content: center;
`;

const KIMELIAOmniaLogo = ({ iconSize = '60px', textSize = '2.2rem', withDownload = false }) => {
  const logoRef = useRef(null); // Ref for the full logo container (for PNG)
  const iconRef = useRef(null); // Ref for the icon SVG (for SVG download)

  const handleDownloadPng = async () => {
    if (logoRef.current) {
      try {
        const dataUrl = await toPng(logoRef.current, { cacheBust: true, pixelRatio: 2 }); // Higher pixelRatio for better quality
        const link = document.createElement('a');
        link.download = 'kimelia-omnia-logo.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to download PNG:', error);
        alert('Failed to download PNG. Check console for details.');
      }
    }
  };

  const handleDownloadSvg = () => {
    if (iconRef.current) {
      const svgElement = iconRef.current.querySelector('svg');
      if (svgElement) {
        
        const clonedSvg = svgElement.cloneNode(true);

        clonedSvg.removeAttribute('aria-labelledby');
        const titleElement = clonedSvg.querySelector('title');
        if (titleElement) titleElement.remove();

        // Serialize the cloned SVG to a string
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Trigger the download
        const link = document.createElement('a');
        link.download = 'kimelia-omnia-icon.svg';
        link.href = svgUrl;
        link.click();
        URL.revokeObjectURL(svgUrl); 
      } else {
          console.error("SVG element not found within iconRef for download.");
      }
    } else {
        console.error("IconRef is null/undefined for SVG download.");
    }
  };

  return (
    <div>
      <LogoContainer ref={logoRef}>
        <div ref={iconRef}> 
          <KIMELIAOmniaIcon size={iconSize} /> {/* No 'id' prop needed anymore, useId handles it */}
        </div>
        <KIMELIAOmniaText fontSize={textSize} />
      </LogoContainer>

      {withDownload && (
        <ButtonWrapper>
          <DownloadButton onClick={handleDownloadSvg}>Download Icon (SVG)</DownloadButton>
          <DownloadButton onClick={handleDownloadPng}>Download Full Logo (PNG)</DownloadButton>
        </ButtonWrapper>
      )}
    </div>
  );
};

export default KIMELIAOmniaLogo;
