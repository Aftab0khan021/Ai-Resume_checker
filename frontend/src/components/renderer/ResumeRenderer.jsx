import React from 'react';
import { SectionHeader, ContactItem, EntryItem, SkillList, SummarySection } from './SectionComponents';
import { getThemeStyle, getFontStyle } from '../../utils/templateThemes';

/**
 * The Master Renderer Component.
 * Takes user data and a template configuration object.
 * Renders the resume entirely based on the config.
 */
export default function ResumeRenderer({ data, config }) {
    if (!config) return null;

    // 1. Resolve Global Styles
    const theme = getThemeStyle(config.themeId || 'slate');
    const font = getFontStyle(config.fontId || 'sans');

    // Inject global font/theme styles
    const containerStyle = {
        fontFamily: font.body === 'font-sans' ? 'ui-sans-serif, system-ui, sans-serif' :
            font.body === 'font-serif' ? 'ui-serif, Georgia, Cambria, serif' : 'ui-monospace, monospace',
        color: config.colors?.text || theme.text,
        backgroundColor: config.colors?.background || theme.bg,
        minHeight: '1000px', // A4 simulation
        width: '100%',
        boxSizing: 'border-box',
        ...config.globalStyles
    };

    // 2. Helper to Render a Specific Section
    const renderSection = (sectionId) => {
        const sectionConfig = config.sections?.[sectionId] || {};
        const styles = sectionConfig.styles || {};

        switch (sectionId) {
            case 'header':
                return (
                    <header key="header" style={{ ...styles.container }}>
                        <h1 style={{ color: config.colors?.primary || theme.primary, ...styles.name }}>
                            {data.fullName}
                        </h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', ...styles.contactRow }}>
                            <ContactItem type="email" value={data.email} styles={styles.contactItem} />
                            <ContactItem type="phone" value={data.phone} styles={styles.contactItem} />
                            {data.linkedin && <ContactItem type="linkedin" value={data.linkedin} styles={styles.contactItem} />}
                        </div>
                    </header>
                );

            case 'contact':
                return (
                    <section key="contact" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Contact"} styles={styles.header} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <ContactItem type="email" value={data.email} styles={styles.contactItem} />
                            <ContactItem type="phone" value={data.phone} styles={styles.contactItem} />
                            {data.linkedin && <ContactItem type="linkedin" value={data.linkedin} styles={styles.contactItem} />}
                        </div>
                    </section>
                );

            case 'summary':
                return data.summary ? (
                    <section key="summary" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Summary"} styles={styles.header} />
                        <SummarySection text={data.summary} styles={styles.text} />
                    </section>
                ) : null;

            case 'experience':
                return data.experience?.length > 0 ? (
                    <section key="experience" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Experience"} styles={styles.header} />
                        {data.experience.map((exp, idx) => (
                            <EntryItem
                                key={idx}
                                title={exp.title}
                                subtitle={exp.company}
                                date={exp.date}
                                description={exp.desc}
                                styles={styles.item}
                            />
                        ))}
                    </section>
                ) : null;

            case 'education':
                return data.education?.length > 0 ? (
                    <section key="education" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Education"} styles={styles.header} />
                        {data.education.map((edu, idx) => (
                            <EntryItem
                                key={idx}
                                title={edu.school}
                                subtitle={edu.degree}
                                date={edu.year}
                                styles={styles.item}
                            />
                        ))}
                    </section>
                ) : null;

            case 'skills':
                return data.skills ? (
                    <section key="skills" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Skills"} styles={styles.header} />
                        <SkillList skills={data.skills} styles={styles.list} />
                    </section>
                ) : null;

            case 'projects':
                return data.projects?.length > 0 ? (
                    <section key="projects" style={{ marginBottom: '2.5rem', ...styles.container }}>
                        <SectionHeader title={sectionConfig.title || "Projects"} styles={styles.header} />
                        {data.projects.map((proj, idx) => (
                            <EntryItem
                                key={idx}
                                title={proj.title}
                                description={proj.desc}
                                styles={styles.item}
                            />
                        ))}
                    </section>
                ) : null;

            default:
                return null;
        }
    };

    // 3. Layout Rendering Logic

    if (config.layout === 'sidebar-left') {
        return (
            <div style={{ ...containerStyle, display: 'flex' }}>
                {/* Sidebar */}
                <aside style={{ width: config.sidebarWidth || '33%', backgroundColor: config.colors?.sidebarBg || theme.secondary, padding: '2rem', ...config.sidebarStyles }}>
                    {config.sidebarOrder?.map(sectionId => renderSection(sectionId))}
                </aside>
                {/* Main Content */}
                <main style={{ flex: 1, padding: '2rem', ...config.mainStyles }}>
                    {config.mainOrder?.map(sectionId => renderSection(sectionId))}
                </main>
            </div>
        );
    }

    if (config.layout === 'sidebar-right') {
        return (
            <div style={{ ...containerStyle, display: 'flex' }}>
                {/* Main Content */}
                <main style={{ flex: 1, padding: '2rem', ...config.mainStyles }}>
                    {config.mainOrder?.map(sectionId => renderSection(sectionId))}
                </main>
                {/* Sidebar */}
                <aside style={{ width: config.sidebarWidth || '30%', backgroundColor: config.colors?.sidebarBg || theme.secondary, padding: '2rem', ...config.sidebarStyles }}>
                    {config.sidebarOrder?.map(sectionId => renderSection(sectionId))}
                </aside>
            </div>
        );
    }

    if (config.layout === 'grid') {
        return (
            <div style={{ ...containerStyle, padding: '2.5rem' }}>
                {/* Header is typically full width in grid */}
                {renderSection('header')}
                <div style={{ display: 'grid', gridTemplateColumns: config.gridColumns || '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    {config.sectionOrder?.filter(id => id !== 'header').map((sectionId) => (
                        <div key={sectionId} style={{ gridColumn: config.gridSpans?.[sectionId] || 'auto' }}>
                            {renderSection(sectionId)}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default: Single Column (Stack)
    return (
        <div style={{ ...containerStyle, padding: config.pagePadding || '2.5rem' }}>
            {config.sectionOrder?.map(sectionId => renderSection(sectionId))}
        </div>
    );
}
