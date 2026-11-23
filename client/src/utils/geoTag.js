/**
 * Utility to burn a professional civic Geo-Tag watermark directly onto an image canvas
 * Similar to BBMP Sahaaya / GPS Map Camera / Karnataka E-Governance civic apps
 */
export async function stampGeoTagOnImage(imageSource, {
  latitude = 13.3409,
  longitude = 77.1010,
  accuracy = 5,
  locationName = 'Tumkur, Karnataka',
  timestamp = new Date(),
  trackingNumber = null,
  urgency = 'MEDIUM',
  emergencyPhase = null,
} = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // 1. Draw original photo
        ctx.drawImage(img, 0, 0);

        // Calculate responsive scale based on image dimensions
        const baseDimension = Math.min(canvas.width, canvas.height);
        const scale = Math.max(0.6, baseDimension / 1000);

        // 1.1 Burn Prominent Emergency Phase Ribbon at Top of Image
        const currentUrgency = (urgency || emergencyPhase?.phase || 'MEDIUM').toUpperCase();
        let phaseColor = '#d97706'; // amber
        let phaseText = '⚡ MEDIUM PHASE (48h SLA)';
        if (currentUrgency === 'EMERGENCY') {
          phaseColor = '#dc2626'; // bold red
          phaseText = '🚨 EMERGENCY PHASE: CRITICAL HAZARD (12h SLA)';
        } else if (currentUrgency === 'HIGH') {
          phaseColor = '#ea580c'; // orange
          phaseText = '⚠️ HIGH PRIORITY PHASE (24h SLA)';
        } else if (currentUrgency === 'LOW') {
          phaseColor = '#16a34a'; // green
          phaseText = 'ℹ️ STANDARD MAINTENANCE PHASE (72h SLA)';
        }

        // Draw Top Emergency Ribbon
        const topRibbonHeight = Math.max(34 * scale, 28);
        ctx.fillStyle = phaseColor;
        ctx.fillRect(0, 0, canvas.width, topRibbonHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(phaseText, canvas.width / 2, topRibbonHeight * 0.7);
        ctx.textAlign = 'left';

        // 2. Geo-Tag Overlay Banner Height (around 18% of image height)
        const bannerHeight = Math.max(120 * scale, 100);
        const bannerY = canvas.height - bannerHeight;

        // Dark gradient semi-transparent background
        const gradient = ctx.createLinearGradient(0, bannerY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.78)'); // slate-900 with 78% opacity
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.94)'); // slate-900 with 94% opacity
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

        // Top accent line in Karnataka Amber / Gold
        ctx.fillStyle = phaseColor;
        ctx.fillRect(0, bannerY, canvas.width, Math.max(5 * scale, 4));

        // 3. Format Date & Time
        const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const formattedTime = dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        // 4. Render Text & Elements
        const paddingX = Math.max(20 * scale, 16);
        let currentY = bannerY + Math.max(28 * scale, 24);

        // Line 1: Brand & Civic Tag
        ctx.fillStyle = '#f59e0b'; // amber-400
        ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
        ctx.fillText('📍 ನಮ್ಮ ತುಮಕೂರು ಪರಿಷ್ಕಾರ | NAMMA TUMAKURU PARISHKARA', paddingX, currentY);

        // Status / Verification badge on the right
        ctx.textAlign = 'right';
        ctx.fillStyle = currentUrgency === 'EMERGENCY' ? '#ef4444' : '#34d399';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.fillText(
          currentUrgency === 'EMERGENCY' ? '🚨 EMERGENCY PRIORITY' : '✔ GPS GEO-TAGGED & VERIFIED',
          canvas.width - paddingX,
          currentY
        );
        ctx.textAlign = 'left';

        // Line 2: Coordinates (Lat / Long / Accuracy)
        currentY += Math.max(24 * scale, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(17 * scale)}px monospace`;
        const latStr = `${Math.abs(latitude).toFixed(6)}° ${latitude >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(longitude).toFixed(6)}° ${longitude >= 0 ? 'E' : 'W'}`;
        ctx.fillText(`LAT: ${latStr}  |  LON: ${lonStr}`, paddingX, currentY);

        // Right side: Date and Time
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f1f5f9';
        ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
        ctx.fillText(`${formattedDate}, ${formattedTime}`, canvas.width - paddingX, currentY);
        ctx.textAlign = 'left';

        // Line 3: Location / Landmark / Taluk
        currentY += Math.max(22 * scale, 18);
        ctx.fillStyle = '#cbd5e1'; // slate-300
        ctx.font = `500 ${Math.round(13 * scale)}px sans-serif`;
        const locationText = locationName || 'Tumkur District, Karnataka, India';
        ctx.fillText(`LOCATION: ${locationText}`, paddingX, currentY);

        // Right side: Accuracy or Tracking
        ctx.textAlign = 'right';
        ctx.fillStyle = '#94a3b8';
        ctx.font = `500 ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(
          trackingNumber ? `REF: ${trackingNumber}` : `ACCURACY: ±${Math.round(accuracy)}m`,
          canvas.width - paddingX,
          currentY
        );
        ctx.textAlign = 'left';

        // Convert canvas back to Blob and dataURL
        canvas.toBlob(
          (blob) => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const watermarkedFile = new File([blob], `geotag-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            resolve({
              blob,
              file: watermarkedFile,
              dataUrl,
              latitude,
              longitude,
              urgency: currentUrgency,
            });
          },
          'image/jpeg',
          0.9
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(new Error('Failed to load image for geo-tagging: ' + err));

    // Handle string dataUrl or Blob
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      reject(new Error('Invalid imageSource provided'));
    }
  });
}
