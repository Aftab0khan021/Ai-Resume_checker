import React from 'react';
import { Mail, Phone, Hash, Globe, MapPin, Linkedin, Github } from 'lucide-react';

// ==========================================
// ATOMIC COMPONENTS
// ==========================================

// 1. SECTION HEADER
export const SectionHeader = ({ title, styles = {}, icon: Icon }) => {
    const headerStyle = {
        fontSize: styles.fontSize || '1.25rem',
        fontWeight: styles.fontWeight || '700',
        color: styles.color || 'inherit',
        borderBottom: styles.borderBottom || 'none',
        borderLeft: styles.borderLeft || 'none',
        borderTop: styles.borderTop || 'none',
        paddingBottom: styles.paddingBottom || '0',
        paddingLeft: styles.paddingLeft || '0',
        paddingTop: styles.paddingTop || '0',
        marginBottom: styles.marginBottom || '1rem',
        marginTop: styles.marginTop || '0',
        textTransform: styles.textTransform || 'none',
        letterSpacing: styles.letterSpacing || 'normal',
        textAlign: styles.textAlign || 'left',
        backgroundColor: styles.backgroundColor || 'transparent',
        padding: styles.padding || undefined,
        display: styles.display || 'flex',
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
            <span style={{ fontSize: styles.fontSize || '0.875rem', color: styles.textColor, fontWeight: styles.fontWeight }}>{value}</span>
        </div>
    );
};

// 3. EXPERIENCE / EDUCATION ITEM
export const EntryItem = ({ title, subtitle, date, location, description, styles = {} }) => {
    return (
        <div style={{ marginBottom: styles.marginBottom || '1.5rem', ...styles.container }} className={styles.className}>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{
                    fontWeight: styles.titleWeight || '700',
                    fontSize: styles.titleSize || '1rem',
                    color: styles.titleColor || 'inherit',
                    margin: 0
                }}>
                    {title}
                </h3>
                {date && (
                    <span style={{
                        fontSize: styles.dateSize || '0.875rem',
                        color: styles.dateColor || 'inherit',
                        fontWeight: styles.dateWeight || '400',
                        fontStyle: styles.dateStyle || 'normal'
                    }}>
                        {date}
                    </span>
                )}
            </div>

            {/* Subtitle Row */}
            {subtitle && (
                <div style={{
                    fontSize: styles.subtitleSize || '0.9rem',
                    color: styles.subtitleColor || 'inherit',
                    marginBottom: '0.5rem',
                    fontStyle: styles.subtitleStyle || 'normal',
                    fontWeight: styles.subtitleWeight || '400'
                }}>
                    {subtitle} {location && `• ${location}`}
                </div>
            )}

            {/* Description */}
            {description && (
                <p style={{
                    fontSize: styles.descSize || '0.875rem',
                    lineHeight: styles.lineHeight || '1.6',
                    color: styles.descColor || 'inherit',
                    margin: 0
                }}>
                    {description}
                </p>
            )}
        </div>
    );
};

// 4. SKILLS LIST
export const SkillList = ({ skills, styles = {} }) => {
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
                        fontWeight: styles.fontWeight || '600'
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
                    <li key={idx} style={{
                        fontSize: styles.fontSize || '0.875rem',
                        color: styles.color || 'inherit',
                        marginBottom: '0.25rem',
                        lineHeight: '1.5'
                    }}>
                        {skill}
                    </li>
                ))}
            </ul>
        );
    }

    // Default: Comma separated text
    return (
        <p style={{
            fontSize: styles.fontSize || '0.875rem',
            lineHeight: '1.6',
            color: styles.color || 'inherit',
            margin: 0
        }}>
            {skillArray.join(styles.separator || ', ')}
        </p>
    );
};

// 5. SUMMARY SECTION
export const SummarySection = ({ text, styles = {} }) => {
    if (!text) return null;
    return (
        <div style={{ marginBottom: styles.marginBottom || '1.5rem', ...styles.container }}>
            <p style={{
                fontSize: styles.fontSize || '0.875rem',
                lineHeight: styles.lineHeight || '1.6',
                color: styles.color || 'inherit',
                fontStyle: styles.fontStyle || 'normal',
                margin: 0
            }}>
                {text}
            </p>
        </div>
    );
};
