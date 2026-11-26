/**
 * Utility functions for email template processing
 */

/**
 * Recursively repair social icons in Unlayer design structure
 * Ensures social blocks have proper icon configuration
 */
export function repairSocialIcons(design: any): any {
  if (!design || typeof design !== 'object') {
    return design;
  }

  // Create a deep copy to avoid mutating the original
  const repaired = JSON.parse(JSON.stringify(design));

  // Recursive function to traverse and repair
  function traverseAndRepair(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Check if this is a social block
    if (obj.type === 'social' && obj.values) {
      // Check if icons are empty or missing
      const iconsArray = obj.values.icons?.icons;
      if (!iconsArray || !Array.isArray(iconsArray) || iconsArray.length === 0) {
        // Repair empty social icons with default icons
        obj.values.icons = {
          iconType: obj.values.icons?.iconType || 'circle',
          icons: [
            {
              name: 'facebook',
              href: 'https://www.facebook.com',
              image: 'https://assets.unlayer.com/editor/icons/facebook-circle.png',
            },
            {
              name: 'twitter',
              href: 'https://www.twitter.com',
              image: 'https://assets.unlayer.com/editor/icons/twitter-circle.png',
            },
            {
              name: 'instagram',
              href: 'https://www.instagram.com',
              image: 'https://assets.unlayer.com/editor/icons/instagram-circle.png',
            },
            {
              name: 'linkedin',
              href: 'https://www.linkedin.com',
              image: 'https://assets.unlayer.com/editor/icons/linkedin-circle.png',
            },
          ],
        };
      } else {
        // Ensure existing icons have proper structure
        obj.values.icons.icons = iconsArray.map((icon: any) => ({
          name: icon.name || 'social',
          href: icon.href || '#',
          image: icon.image || icon.src || `https://assets.unlayer.com/editor/icons/${icon.name || 'social'}-circle.png`,
        }));
      }
    }

    // Recursively traverse arrays and objects
    // Handle Unlayer's specific structure: body.rows[].columns[].contents[]
    if (Array.isArray(obj)) {
      obj.forEach(item => traverseAndRepair(item));
    } else if (obj.contents && Array.isArray(obj.contents)) {
      obj.contents.forEach((content: any) => traverseAndRepair(content));
    } else if (obj.columns && Array.isArray(obj.columns)) {
      obj.columns.forEach((column: any) => {
        if (column.contents && Array.isArray(column.contents)) {
          column.contents.forEach((content: any) => traverseAndRepair(content));
        } else {
          traverseAndRepair(column);
        }
      });
    } else if (obj.rows && Array.isArray(obj.rows)) {
      obj.rows.forEach((row: any) => {
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach((column: any) => {
            if (column.contents && Array.isArray(column.contents)) {
              column.contents.forEach((content: any) => traverseAndRepair(content));
            } else {
              traverseAndRepair(column);
            }
          });
        } else {
          traverseAndRepair(row);
        }
      });
    } else if (obj.body) {
      // Handle design.body structure
      traverseAndRepair(obj.body);
    } else {
      // Generic traversal
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          traverseAndRepair(value);
        }
      });
    }
  }

  traverseAndRepair(repaired);
  return repaired;
}

/**
 * Validate and ensure social icons are properly structured
 * If social icons are empty, preserves structure but doesn't auto-fill
 * Use repairSocialIcons if you want to auto-fill empty icons
 */
export function ensureSocialIconsStructure(design: any): any {
  if (!design || typeof design !== 'object') {
    return design;
  }

  const repaired = JSON.parse(JSON.stringify(design));

  function fixSocialBlock(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Fix social blocks - ensure structure is valid
    if (obj.type === 'social' && obj.values) {
      // Ensure icons object exists
      if (!obj.values.icons) {
        obj.values.icons = {
          iconType: 'circle',
          icons: [],
        };
      }
      // Ensure icons array exists
      if (!Array.isArray(obj.values.icons.icons)) {
        obj.values.icons.icons = [];
      }
      // Ensure existing icons have proper structure
      if (obj.values.icons.icons.length > 0) {
        obj.values.icons.icons = obj.values.icons.icons.map((icon: any) => ({
          name: icon.name || 'social',
          href: icon.href || '#',
          image: icon.image || icon.src || `https://assets.unlayer.com/editor/icons/${icon.name || 'social'}-circle.png`,
        }));
      }
    }

    // Recursively process nested structures
    if (Array.isArray(obj)) {
      obj.forEach(item => fixSocialBlock(item));
    } else if (obj.contents && Array.isArray(obj.contents)) {
      obj.contents.forEach((content: any) => fixSocialBlock(content));
    } else if (obj.columns && Array.isArray(obj.columns)) {
      obj.columns.forEach((column: any) => {
        if (column.contents && Array.isArray(column.contents)) {
          column.contents.forEach((content: any) => fixSocialBlock(content));
        }
      });
    } else if (obj.rows && Array.isArray(obj.rows)) {
      obj.rows.forEach((row: any) => {
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach((column: any) => {
            if (column.contents && Array.isArray(column.contents)) {
              column.contents.forEach((content: any) => fixSocialBlock(content));
            }
          });
        }
      });
    } else {
      // Generic traversal
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          fixSocialBlock(value);
        }
      });
    }
  }

  fixSocialBlock(repaired);
  return repaired;
}

/**
 * Check if design has any social blocks with empty icons
 */
export function hasEmptySocialIcons(design: any): boolean {
  if (!design || typeof design !== 'object') {
    return false;
  }

  let foundEmpty = false;

  function checkSocialBlock(obj: any): void {
    if (!obj || typeof obj !== 'object' || foundEmpty) {
      return;
    }

    if (obj.type === 'social' && obj.values?.icons) {
      if (!obj.values.icons.icons || !Array.isArray(obj.values.icons.icons) || obj.values.icons.icons.length === 0) {
        foundEmpty = true;
        return;
      }
    }

    // Recursively check
    if (Array.isArray(obj)) {
      obj.forEach(item => checkSocialBlock(item));
    } else {
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          checkSocialBlock(value);
        }
      });
    }
  }

  checkSocialBlock(design);
  return foundEmpty;
}

/**
 * Generate social icons HTML from design structure
 * Used to inject missing social icons into HTML
 */
export function generateSocialIconsHTML(design: any): string {
  if (!design || typeof design !== 'object') {
    return '';
  }

  let socialIconsHTML = '';
  const defaultIcons = [
    { name: 'facebook', href: 'https://www.facebook.com', image: 'https://assets.unlayer.com/editor/icons/facebook-circle.png' },
    { name: 'twitter', href: 'https://www.twitter.com', image: 'https://assets.unlayer.com/editor/icons/twitter-circle.png' },
    { name: 'instagram', href: 'https://www.instagram.com', image: 'https://assets.unlayer.com/editor/icons/instagram-circle.png' },
    { name: 'linkedin', href: 'https://www.linkedin.com', image: 'https://assets.unlayer.com/editor/icons/linkedin-circle.png' },
  ];

  function findSocialBlock(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    if (obj.type === 'social' && obj.values) {
      return obj.values;
    }

    // Recursively search
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = findSocialBlock(item);
        if (found) return found;
      }
    } else if (obj.contents && Array.isArray(obj.contents)) {
      for (const content of obj.contents) {
        const found = findSocialBlock(content);
        if (found) return found;
      }
    } else if (obj.columns && Array.isArray(obj.columns)) {
      for (const column of obj.columns) {
        if (column.contents && Array.isArray(column.contents)) {
          for (const content of column.contents) {
            const found = findSocialBlock(content);
            if (found) return found;
          }
        }
      }
    } else if (obj.rows && Array.isArray(obj.rows)) {
      for (const row of obj.rows) {
        if (row.columns && Array.isArray(row.columns)) {
          for (const column of row.columns) {
            if (column.contents && Array.isArray(column.contents)) {
              for (const content of column.contents) {
                const found = findSocialBlock(content);
                if (found) return found;
              }
            }
          }
        }
      }
    } else if (obj.body) {
      return findSocialBlock(obj.body);
    } else {
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          const found = findSocialBlock(value);
          if (found) return found;
        }
      }
    }

    return null;
  }

  const socialBlock = findSocialBlock(design);
  if (!socialBlock) {
    return '';
  }

  const icons = socialBlock.icons?.icons || [];
  const iconSize = socialBlock.iconSize || 32;
  const spacing = socialBlock.spacing || 5;
  const align = socialBlock.align || 'center';
  const iconType = socialBlock.icons?.iconType || 'circle';

  // Use icons from design if available, otherwise use defaults
  const iconsToRender = icons.length > 0 ? icons : defaultIcons;

  if (iconsToRender.length === 0) {
    return '';
  }

  // Generate HTML for social icons
  const iconHTML = iconsToRender.map((icon: any) => {
    const href = icon.href || '#';
    const image = icon.image || icon.src || `https://assets.unlayer.com/editor/icons/${icon.name || 'social'}-circle.png`;
    return `<a href="${href}" style="display: inline-block; margin: 0 ${spacing}px;" target="_blank" rel="noopener noreferrer">
      <img src="${image}" alt="${icon.name || 'social'}" width="${iconSize}" height="${iconSize}" style="display: block; border: none; outline: none; text-decoration: none;" />
    </a>`;
  }).join('');

  return `<div align="${align}" style="direction: ltr; padding: 10px;">
    <div style="display: table; margin: 0 auto;">
      ${iconHTML}
    </div>
  </div>`;
}

/**
 * Inject social icons into HTML if they're missing
 */
export function injectSocialIconsIntoHTML(html: string, design: any): string {
  // Check if HTML already has social icons
  if (html.includes('u_content_social') || html.includes('aria-label="social"')) {
    // Check if the social section is empty
    const socialSectionRegex = /<div[^>]*aria-label="social"[^>]*>[\s\S]*?<\/div>/i;
    const match = html.match(socialSectionRegex);
    
    if (match && match[0]) {
      // Check if the social section is empty (no actual icon links)
      if (!match[0].includes('<a') || !match[0].includes('<img')) {
        // Replace empty social section with generated icons
        const socialIconsHTML = generateSocialIconsHTML(design);
        if (socialIconsHTML) {
          return html.replace(socialSectionRegex, socialIconsHTML);
        }
      }
    }
  } else {
    // No social section found, try to inject before closing tags
    const socialIconsHTML = generateSocialIconsHTML(design);
    if (socialIconsHTML) {
      // Try to inject before the last table or div closing tag
      const lastTableIndex = html.lastIndexOf('</table>');
      if (lastTableIndex !== -1) {
        return html.slice(0, lastTableIndex) + socialIconsHTML + html.slice(lastTableIndex);
      }
    }
  }

  return html;
}
