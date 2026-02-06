import React from 'react';
import { Mail, Phone, Hash, Globe, MapPin, Linkedin, Github } from 'lucide-react';

// ==========================================
// ATOMIC COMPONENTS
// ==========================================

// 1. SECTION HEADER
export const SectionHeader = ({ title, styles = {}, icon: Icon }) => {
    // Default styles if not provided
    const headerStyle = {
        fontSize: styles.fontSize || '1.25rem',
        fontWeight: styles.fontWeight || 'bold',
        color: styles.color || 'inherit',
        borderBottom: styles.borderBottom || 'none',
        borderLeft: styles.borderLeft || 'none',
        paddingBottom: styles.paddingBottom || '0',
        paddingLeft: styles.paddingLeft || '0',
        marginBottom: styles.marginBottom || '1rem',
        textTransform: styles.textTransform || 'none',
        letterSpacing: styles.letterSpacing || 'normal',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...styles.customCss
    };

    return (
        <h2 style={headerStyle} className={styles.className}>
            {Icon && <Icon size={styles.iconSize || 18} />}
            {title}
        </h2>
    );
};

// 2. CONTACT INFO ITEM
export const ContactItem = ({ type, value, styles = {} }) => {
    const iconMap = {
        email: Mail,
        phone: Phone,
        linkedin: Linkedin,
        github: Github,
        location: MapPin,
        website: Globe,
        default: Hash
    };

    const IconComp = iconMap[type] || iconMap.default;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...styles.container }} className={styles.className}>
            <IconComp size={styles.iconSize || 14} style={{ color: styles.iconColor }} />
            <span style={{ fontSize: styles.fontSize || '0.875rem', color: styles.textColor }}>{value}</span>
        </div>
    );
};

// 3. EXPERIENCE / EDUCATION ITEM
export const EntryItem = ({ title, subtitle, date, location, description, styles = {} }) => {
    return (
        <div style={{ marginBottom: styles.marginBottom || '1.5rem', ...styles.container }} className={styles.className}>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: styles.titleSize || '1rem', color: styles.titleColor }}>
                    {title}
                </h3>
                {date && (
                    <span style={{ fontSize: styles.dateSize || '0.875rem', color: styles.dateColor, fontWeight: styles.dateWeight }}>
                        {date}
                    </span>
                )}
            </div>

            {/* Subtitle Row */}
            {subtitle && (
                <div style={{ fontSize: styles.subtitleSize || '0.9rem', color: styles.subtitleColor, marginBottom: '0.5rem', fontStyle: styles.subtitleStyle }}>
                    {subtitle} {location && `• ${location}`}
                </div>
            )}

            {/* Description */}
            {description && (
                <p style={{ fontSize: styles.descSize || '0.875rem', lineHeight: styles.lineHeight || '1.5', color: styles.descColor }}>
                    {description}
                </p>
            )}
        </div>
    );
};

// 4. SKILLS LIST
export const SkillList = ({ skills, styles = {} }) => {
    // If skills is a string, split it. If array, use as is.
    const skillArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : (skills || []);

    if (styles.variant === 'tags') {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillArray.map((skill, idx) => (
                    <span key={idx} style={{
                        backgroundColor: styles.tagBg || '#f1f5f9',
                        color: styles.tagColor || '#334155',
                        padding: '0.25rem 0.75rem',
                        borderRadius: styles.borderRadius || '9999px',
                        fontSize: styles.fontSize || '0.75rem',
                        fontWeight: '600'
                    }}>
                        {skill}
                    </span>
                ))}
            </div>
        );
    }

    if (styles.variant === 'bullet') {
        return (
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
                {skillArray.map((skill, idx) => (
                    <li key={idx} style={{ fontSize: styles.fontSize || '0.875rem', color: styles.color, marginBottom: '0.25rem' }}>
                        {skill}
                    </li>
                ))}
            </ul>
        );
    }

    // Default: Comma separated text
    return (
        <p style={{ fontSize: styles.fontSize || '0.875rem', lineHeight: '1.6', color: styles.color }}>
            {skillArray.join(styles.separator || ', ')}
        </p>
    );
};

// 5. SUMMARY SECTION
export const SummarySection = ({ text, styles = {} }) => {
    if (!text) return null;
    return (
        <div style={{ marginBottom: styles.marginBottom || '1.5rem', ...styles.container }}>
            <p style={{ fontSize: styles.fontSize || '0.875rem', lineHeight: styles.lineHeight || '1.6', color: styles.color, fontStyle: styles.fontStyle }}>
                {text}
            </p>
        </div>
    );
};
